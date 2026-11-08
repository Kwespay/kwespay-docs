---
title: API overview
description: The KwesPay GraphQL API used by every integration, its endpoints, transport, authentication, response conventions and the public payment operations.
sidebar:
  label: Overview
  order: 1
---

KwesPay exposes one GraphQL endpoint per environment. The widget and the SDK are clients of this API, and you can call it directly, for example from your server.

| Environment | Endpoint |
| --- | --- |
| Mainnet | `https://api.kwespay.xyz/graphql` |
| Testnet | `https://api.testnet.kwespay.xyz/graphql` |

## Transport

Send an HTTP `POST` with a JSON body of `query` and `variables`:

```sh
curl https://api.testnet.kwespay.xyz/graphql \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $KWESPAY_API_KEY" \
  -d '{"query":"query($ref:String!){getTransactionStatus(transactionReference:$ref){transactionStatus}}","variables":{"ref":"YOUR_TRANSACTION_REFERENCE"}}'
```

- Field and argument names are camelCase.
- Introspection is disabled. Use this reference instead of a schema explorer.
- CORS is open, so browsers on any origin can call the payment operations. Authentication uses headers, never cookies.

## Payment operations

These are the operations a payment integration uses. The dashboard uses further operations that require a logged-in merchant session. They are not part of the public integration surface and are not documented here.

| Operation | Type | Auth | Purpose |
| --- | --- | --- | --- |
| [`createQuote`](/api/operations/create-quote/) | Mutation | API key | Price a fiat amount in a token on one network |
| [`createTransaction`](/api/operations/create-transaction/) | Mutation | API key | Turn a quote into signed payment terms |
| [`submitTransactionHash`](/api/operations/submit-transaction-hash/) | Mutation | API key | Report the broadcast transaction hash |
| [`getTransactionStatus`](/api/operations/get-transaction-status/) | Query | None | Read the status of a payment |
| [`validateAccessKey`](/api/operations/validate-access-key/) | Query | None | Check an API key and its scope |
| [`getVendor`](/api/operations/get-vendor/) | Query | None | Read a merchant's public payment configuration |
| [Payment link operations](/api/operations/payment-link-checkout/) | Query, Mutation | None | Read, price and pay a payment link |
| [Cross-chain operations](/api/operations/cross-chain-payments/) | Query, Mutation | API key, except `paymentRoute` | Pay a USDC on Base invoice with XLM or BTC |

## Response conventions

- `createQuote` and `createTransaction` return a payload with `success` and `message`. When `success` is `false`, the other fields are `null` and `message` explains why.
- The other operations return GraphQL `errors` on failure, with `data` set to `null` for the failed field.
- Amounts in base units are strings. Display amounts are floats.
- Timestamps such as `expiresAt` are ISO 8601 strings in UTC without a timezone suffix.

See [Errors](/api/errors/) for messages and their meaning.

## Rate limits

Each client IP may make 200 requests per 60 seconds. Above that the API returns HTTP `429` with a `Retry-After` header in seconds. Successful responses include `X-RateLimit-Remaining`.
