---
title: Payment confirmation
description: Decide whether an order is paid with one verifyPayment call that checks on-chain confirmation, the order, the amount and the currency for you.
sidebar:
  order: 5
---

Before you ship goods, grant access or mark an invoice paid, confirm the payment on your server. There are two ways, and most integrations use both:

- **[Webhooks](/guides/webhooks/)**: KwesPay calls your server when the payment settles, even if the customer closed the page.
- **`verifyPayment`**: your server asks KwesPay about a reference whenever it needs to, for example when a browser reports one or during reconciliation.

One `verifyPayment` call does every check:

```ts title="server.ts"
import { KwesPayClient } from "@kwespay/client";

const kwespay = new KwesPayClient({ apiKey: process.env.KWESPAY_API_KEY! });

const check = await kwespay.verifyPayment(reference, {
  orderId: order.id,
  amount: order.total,
  currency: order.currency,
});

if (check.paid) {
  await markOrderPaid(order.id, reference);
} else {
  console.log(check.status, check.reason);
}
```

From any other language, send the [`verifyPayment`](/api/operations/verify-payment/) query with your API key in `X-API-Key`.

## What `paid: true` means

KwesPay returns `paid: true` only when all of these hold:

| Check | Fails with |
| --- | --- |
| The payment belongs to a merchant your API key can access | `Transaction not found` |
| It was created for `orderId` | "This payment belongs to a different order." |
| It was priced in `currency` | "This payment was priced in GHS, not USD." |
| It was priced at `amount`, to within half a cent | "This payment was for 1, not 120." |
| KwesPay confirmed it on-chain as `completed` or `overpaid` | "The payment has not been confirmed on-chain yet." |

`amount` and `currency` are required, so a cheaper payment can never be accepted for a more expensive order. `orderId` works when checkout was opened with the same `orderId`. Without it, store the reference with the order and accept each reference for one order only.

Before answering, KwesPay checks the chain for payments that are still `processing`, so a call made right after the customer pays returns the current state.

## Where the reference comes from

| Integration | Reference |
| --- | --- |
| HTML embed | `event.detail.transactionReference` from the button's `kwespay:result` event |
| Widget | `payment.transactionReference` from `kwespay()` |
| SDK | `result.transactionReference` from `checkout()` |

The browser hands you the reference, but only `verifyPayment` tells you whether it is paid. A reference typed into a URL, or a result edited in the browser console, fails the check.

## When it is not paid yet

| `status` | What to do |
| --- | --- |
| `pending`, `processing` | Not confirmed yet. Check again shortly, or from a scheduled job for orders still waiting |
| `underpaid` | Less than the quoted amount arrived. Hold the order for review |
| `overpaid` | More arrived. `paid` is `true`. Refund the difference if your policy says so |
| `expired` | No payment was recorded in time. If `txHash` is set, look it up before cancelling |
| `failed`, `refunded` | Do not fulfil |

See [Payment statuses](/merchants/payment-statuses/) for the full lifecycle.

## How KwesPay confirms

1. When the wallet broadcasts the payment, the widget and SDK report the transaction hash and the status becomes `processing`.
2. KwesPay reads the payment contract's events and waits for the configured confirmations.
3. It compares the amount the merchant received with the quote. A difference of up to 0.1% is `completed`. A larger one is `underpaid` or `overpaid`.
4. Quotes and transactions that were never paid expire.

Only KwesPay's chain listeners can set `completed`, `underpaid` or `overpaid`. No client and no dashboard action can.
