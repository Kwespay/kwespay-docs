---
title: Webhooks
description: Receive signed server-to-server notifications when a KwesPay payment succeeds, falls short, fails, expires or is refunded, without a redirect or an open checkout page.
sidebar:
  order: 6
---

KwesPay calls an HTTPS endpoint on your server whenever a payment reaches a final state. The customer can close the page as soon as their wallet confirms, and your server still learns the outcome.

| | Browser events | Webhooks |
| --- | --- | --- |
| Where they run | The customer's browser | Your server |
| Use them to | Update the checkout screen | Fulfil orders |
| Signed by KwesPay | No | Yes |
| Arrive if the tab is closed | No | Yes |

Browser events such as `kwespay:paymentConfirmed` and `kwespay:result` are for the interface. Webhooks, or a [`verifyPayment`](/guides/payment-confirmation/) call, are for fulfilment.

## 1. Add an endpoint

Webhook endpoints are managed with your dashboard login, never with the public API key. Send these GraphQL requests with the `Authorization: Bearer` token from the dashboard session.

```graphql
mutation {
  createWebhookEndpoint(input: {
    vendorIdentifier: "YOUR_VENDOR_ID"
    url: "https://shop.example/webhooks/kwespay"
    description: "Order fulfilment"
    enabledEvents: ["payment.succeeded", "payment.underpaid", "payment.refunded"]
  }) {
    secret
    endpoint { id url enabledEvents active }
  }
}
```

`secret` is shown **once**. Store it in your server's secret store, for example as `KWESPAY_WEBHOOK_SECRET`. KwesPay keeps only an encrypted copy and never returns it again.

Leave out `enabledEvents` to receive every payment event. A vendor can have up to five endpoints.

Endpoint rules:

- `https://` only, on port 443 or 8443, with a public domain name. Addresses that resolve to private, loopback, link-local or cloud metadata ranges are refused, both when you save the endpoint and on every delivery.
- No user name or password in the URL. Authenticate requests by their signature instead.
- Redirects are not followed. Point the endpoint at the final URL.

## 2. Verify and handle events

Read the **raw** request body. Verify the signature before parsing it or acting on it.

### Node.js

```ts title="server.ts"
import express from "express";
import { KwesPayClient, verifyWebhook } from "@kwespay/client";

const app = express();
const kwespay = new KwesPayClient({ apiKey: process.env.KWESPAY_API_KEY! });

app.post("/webhooks/kwespay", express.raw({ type: "application/json" }), async (req, res) => {
  let event;
  try {
    event = await verifyWebhook(req.body, req.header("KwesPay-Signature"), process.env.KWESPAY_WEBHOOK_SECRET!);
  } catch {
    return res.sendStatus(400);
  }

  await db.transaction(async (tx) => {
    const isNew = await tx.webhookEvents.insertIfAbsent(event.id);
    if (!isNew || event.type !== "payment.succeeded") return;

    const order = await tx.orders.find(event.data.orderReference);
    if (!order) return;
    const check = await kwespay.verifyPayment(event.data.transactionReference, {
      orderId: order.id,
      amount: order.total,
      currency: order.currency,
    });
    if (check.paid) await tx.orders.markPaid(order.id, event.data.transactionReference);
  });

  res.sendStatus(200);
});
```

`insertIfAbsent` stands for an insert into a table with a unique key on the event ID that reports whether a row was added. Because it runs in the same transaction as the fulfilment, a failure rolls both back, your endpoint answers with an error, and KwesPay retries the event.

`verifyWebhook()` works in Node.js 20 or later, Deno, Bun and edge runtimes. It throws a `KwesPayError` with code `WEBHOOK_SIGNATURE_INVALID` for a missing, wrong or expired signature.

### Python

```python title="webhooks.py"
import hashlib
import hmac
import os
import time

from fastapi import FastAPI, Header, HTTPException, Request

app = FastAPI()
SECRET = os.environ["KWESPAY_WEBHOOK_SECRET"].encode()


def verify(body: bytes, header: str, tolerance: int = 300) -> None:
    parts = [p.split("=", 1) for p in header.split(",") if "=" in p]
    timestamp = next((v for k, v in parts if k == "t"), None)
    signatures = [v for k, v in parts if k == "v1"]
    if not timestamp or not timestamp.isdigit() or not signatures:
        raise HTTPException(400)
    if abs(time.time() - int(timestamp)) > tolerance:
        raise HTTPException(400)
    expected = hmac.new(SECRET, timestamp.encode() + b"." + body, hashlib.sha256).hexdigest()
    if not any(hmac.compare_digest(expected.encode(), s.encode()) for s in signatures):
        raise HTTPException(400)


@app.post("/webhooks/kwespay")
async def kwespay_webhook(request: Request, kwespay_signature: str = Header("")):
    body = await request.body()
    verify(body, kwespay_signature)
    event = await request.json()
    handle_once(event["id"], event)
    return {"received": True}
```

Respond with any `2xx` status within 10 seconds. Do slow work after responding, for example from a job queue.

## Signatures

Every request carries:

| Header | Value |
| --- | --- |
| `KwesPay-Signature` | `t=<unix seconds>,v1=<hex HMAC-SHA256>`. During a secret rotation there are two `v1` values |
| `KwesPay-Event-Id` | The event ID, `evt_…`. The same on every retry |
| `KwesPay-Event-Type` | For example `payment.succeeded` |
| `KwesPay-Delivery-Id` | The delivery ID, `whd_…` |
| `KwesPay-Delivery-Attempt` | `1` for the first attempt, then `2`, `3` and so on |

The signature is `HMAC_SHA256(secret, t + "." + raw_body)`, hex-encoded in lower case. `t` is the time of that delivery attempt, so retries sent hours later still verify within the tolerance. Reject a request when no `v1` value matches, or when `t` is more than 5 minutes from your clock. Compare with a constant-time function.

A valid signature proves the request came from KwesPay and was not changed. Still deduplicate by event ID, and check the order, amount and currency before fulfilling.

## Events

| Type | When | `data.status` |
| --- | --- | --- |
| `payment.succeeded` | KwesPay confirmed the payment on-chain for at least the quoted amount | `completed` or `overpaid` |
| `payment.underpaid` | Less than the quoted amount arrived | `underpaid` |
| `payment.failed` | The on-chain payment did not match the signed terms, for example the wrong recipient or token | `failed` |
| `payment.expired` | No payment was recorded before the quote expired | `expired` |
| `payment.refunded` | The merchant marked a paid payment as refunded | `refunded` |
| `webhook.test` | You sent a test event | none |

Payments are confirmed only by KwesPay's chain listeners, after the required number of block confirmations. A wallet broadcast, a browser callback or a transaction hash sent by the customer never produces a payment event.

## Payload

```json
{
  "id": "evt_8f4a0c2e6b1d4c39a1f7e2d05b9c6a13",
  "object": "event",
  "type": "payment.succeeded",
  "apiVersion": "2026-10-19",
  "createdAt": "2026-10-19T12:04:31.512418Z",
  "environment": "mainnet",
  "data": {
    "transactionReference": "3f0c6c1e-6a9e-4d4f-9a53-1e2b8c7d9f10",
    "orderReference": "A-1042",
    "quoteReference": "b7a1c9d2-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    "status": "completed",
    "vendorIdentifier": "YOUR_VENDOR_ID",
    "fiatAmount": "49.99",
    "fiatCurrency": "USD",
    "token": "USDC",
    "network": "base",
    "tokenDecimals": 6,
    "amountBaseUnits": "49990000",
    "totalBaseUnits": "50239950",
    "receivedBaseUnits": "49990000",
    "blockchainHash": "0x…",
    "initiatedAt": "2026-10-19T12:03:58.204511Z",
    "statusChangedAt": "2026-10-19T12:04:31.498230Z",
    "paymentLink": null
  }
}
```

Units:

- `fiatAmount` is a decimal string in the currency's major unit, so `"49.99"` is 49.99 USD. Compare it as a decimal, not a float.
- `amountBaseUnits`, `totalBaseUnits` and `receivedBaseUnits` are integer strings in the token's smallest unit. Divide by `10 ^ tokenDecimals` for whole tokens: `49990000` with 6 decimals is 49.99 USDC.
- `amountBaseUnits` is what the merchant was quoted, `totalBaseUnits` what the customer paid including the fee, and `receivedBaseUnits` what the merchant's wallet received. `receivedBaseUnits` is `null` until the payment settles.

Timestamps are ISO 8601 in UTC with a `Z` suffix and up to six fractional digits. Parse them with a date library rather than a fixed format.

For payments made through a [payment link](/merchants/payment-links/), `paymentLink` identifies the link and the details the customer entered. It is `null` for other payments.

```json
"paymentLink": {
  "id": "pl_…",
  "slug": "osu-coffee",
  "title": "Osu Coffee Roasters",
  "purpose": "product",
  "linkVersion": 2,
  "customerName": "Esi Adjei",
  "customerEmail": "esi@example.com",
  "customerReference": "INV-118"
}
```

Customer fields are `null` when the link didn't ask for them. Payloads never carry secrets or payer wallet addresses.

## Retries

| Response | What KwesPay does |
| --- | --- |
| Any `2xx` | Delivered. No more attempts |
| Timeout, connection or TLS error, `408`, `425`, `429`, any `5xx` | Retries with exponential backoff and jitter: about 30 seconds, then 1, 2, 4, 8 minutes and so on, capped at 6 hours between attempts, for up to 12 attempts. The last attempt comes about 15 hours after the first. A `Retry-After` header on any of these responses is respected, up to 6 hours |
| `3xx` and other `4xx` | Stops. The delivery is marked `exhausted` |

Requests time out after 5 seconds to connect and 10 seconds to respond. Only the first 8 KB of your response is read.

Deliveries are **at least once**, so an event can arrive more than once, and two copies can occasionally arrive at the same time. Record `event.id` under a unique constraint, for example an insert that fails on a duplicate key, and skip the event when the insert fails. A check followed by a separate write lets both copies through. `event.id` stays the same across retries and redeliveries, so it is safe to deduplicate on. Each status change of a payment is a separate event with its own ID.

### Ordering

Process each event on its own merits rather than by arrival order. For example `payment.expired` can be followed by `payment.succeeded` when a payment confirms on-chain after its quote expired. That payment is paid. Use `data.status`, `data.statusChangedAt`, or a fresh [`verifyPayment`](/guides/payment-confirmation/) call to decide, and never move an order from paid back to unpaid because an older event arrived late.

## Delivery history and redelivery

```graphql
query {
  webhookDeliveries(endpointId: "we_…", status: "exhausted") {
    id eventId eventType status attempts lastResponseStatus lastError nextAttemptAt
  }
}

mutation {
  redeliverWebhook(deliveryId: "whd_…") { id status }
}
```

`webhookDelivery(deliveryId)` also returns each attempt with its time, duration and status code, plus the exact payload. A redelivery sends the same event ID and payload with a fresh signature.

If your endpoint was down for longer than the retry window, list exhausted deliveries and redeliver them, or call `verifyPayment` for the affected orders.

## Test locally

Your endpoint must be reachable on the public internet over HTTPS. For local development, expose your server with a tunnel such as `cloudflared tunnel --url http://localhost:3000` or `ngrok http 3000`, register the tunnel URL on the testnet dashboard, then send a test event:

```graphql
mutation {
  sendTestWebhook(endpointId: "we_…") { id status }
}
```

A test event has type `webhook.test` and is signed like any other. You can send 20 per endpoint per hour.

## Manage endpoints

| Operation | Purpose |
| --- | --- |
| `webhookEndpoints(vendorIdentifier)` | List endpoints. Secrets are never included |
| `updateWebhookEndpoint(endpointId, input)` | Change the URL, description or events, or pause with `active: false`. Paused endpoints receive nothing, and pending deliveries to them are cancelled |
| `rotateWebhookSecret(endpointId)` | Issue a new secret. For 24 hours KwesPay signs with both the new and the previous secret, so you can deploy the new one without downtime. Deploy it before rotating again |
| `deleteWebhookEndpoint(endpointId)` | Remove the endpoint and its delivery history |
| `webhookEventTypes` | List the event types you can subscribe to |

Every change is recorded in KwesPay's security audit log.
