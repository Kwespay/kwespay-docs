---
title: Cross-chain payments
description: The GraphQL operations behind paying with XLM or BTC through NEAR Intents, used to price a route, create a deposit and follow it to settlement.
sidebar:
  order: 9
---

These operations let a customer pay a USDC on Base invoice with XLM or BTC. [NEAR Intents](https://near-intents.org) converts the deposit and delivers USDC to the merchant. See [Pay from any chain](/guides/pay-from-any-chain/) for the full picture.

| Operation | Type | Auth | Purpose | Limit |
| --- | --- | --- | --- | --- |
| `crossChainOptions(quoteId)` | Query | `X-API-Key` header | Live price, time estimate and minimum for each asset | 30/min per IP |
| `createCrossChainPayment(input)` | Mutation | `X-API-Key` header | Create the payment and its deposit address | 12/min per IP |
| `submitCrossChainDeposit(transactionReference, txHash)` | Mutation | `X-API-Key` header | Optional hint that a deposit was sent | API limit |
| `paymentRoute(transactionReference)` | Query | None | Read the route's current state | API limit |

The SDK wraps all four in [`checkoutFromAnotherAsset()`](/sdk/methods/#pay-from-another-asset).

## Flow

1. Check that `crossChainNetworks` from [`getVendor`](/api/operations/get-vendor/) includes `base`.
2. Call [`createQuote`](/api/operations/create-quote/) with `network: "base"` and `token: "USDC"`.
3. Call `crossChainOptions` and show the options where `available` is `true`.
4. Call `createCrossChainPayment` and show the customer the deposit details.
5. Poll `paymentRoute` until `status` is `settled`, `refunded`, `failed` or `expired`.
6. Confirm the order on your server with [`verifyPayment`](/api/operations/verify-payment/).

## `crossChainOptions`

```graphql
query CrossChainOptions($quoteId: Int!) {
  crossChainOptions(quoteId: $quoteId): [CrossChainOption!]!
}
```

| Field | Type | Description |
| --- | --- | --- |
| `originAsset` | `String!` | `XLM` or `BTC` |
| `name` | `String!` | Asset name |
| `chain` | `String!` | `stellar` or `btc` |
| `chainName` | `String!` | Chain display name |
| `decimals` | `Int!` | Decimals of the asset |
| `available` | `Boolean!` | The asset can pay this quote |
| `amountIn` | `String` | Amount to send, in base units |
| `amountInFormatted` | `String` | Amount to send, in whole units |
| `amountInUsd` | `String` | USD value of the amount to send |
| `timeEstimateSeconds` | `Int` | Estimated conversion time |
| `minimumUsd` | `String!` | Smallest invoice this asset can pay |
| `needsMemo` | `Boolean!` | The deposit must include `depositMemo` |
| `reason` | `String` | Why the asset is unavailable |
| `code` | `String` | Error code when unavailable |

## `createCrossChainPayment`

```graphql
mutation CreateCrossChainPayment($input: CreateCrossChainPaymentInput!) {
  createCrossChainPayment(input: $input) {
    success
    message
    code
    resumed
    route { transactionReference status depositAddress depositMemo amountInFormatted deadline }
  }
}
```

| Input | Type | Description |
| --- | --- | --- |
| `quoteId` | `Int!` | From `createQuote` |
| `originAsset` | `String!` | `XLM` or `BTC` |
| `refundAddress` | `String!` | The customer's address on the origin chain |

Check `success` before reading `route`. When it is `false`, `message` explains why and `code` identifies the failure.

Calling again with the same `quoteId`, `originAsset` and `refundAddress` returns the existing route with `resumed: true`. Different values return `QUOTE_USED`.

| Code | Meaning |
| --- | --- |
| `CROSS_CHAIN_DISABLED` | The merchant has not turned on payments from other assets |
| `ROUTE_UNSUPPORTED` | This asset can't pay this token and network |
| `NETWORK_NOT_ENABLED` | The merchant has no active wallet on the destination network |
| `MERCHANT_UNAVAILABLE` | The merchant can't accept payments right now |
| `AMOUNT_BELOW_MINIMUM` | The invoice is below `minimumUsd` |
| `INVALID_REFUND_ADDRESS` | The address isn't valid on the origin chain |
| `QUOTE_NOT_FOUND`, `QUOTE_EXPIRED`, `QUOTE_USED` | Request a new quote |
| `QUOTE_SIGNATURE_INVALID`, `QUOTE_MISMATCH` | The conversion quote failed verification. No deposit address is issued |
| `RATE_LIMITED`, `INVALID_KEY`, `UNAVAILABLE` | Retry later, or check the API key |

## `paymentRoute`

```graphql
query PaymentRoute($transactionReference: String!) {
  paymentRoute(transactionReference: $transactionReference): PaymentRoute!
}
```

| Field | Type | Description |
| --- | --- | --- |
| `routeId` | `String!` | Route ID |
| `transactionReference` | `String!` | Payment reference |
| `transactionStatus` | `String!` | The payment's status, as in `verifyPayment` |
| `status` | `String!` | Route status, below |
| `originAsset`, `originChain` | `String!` | What the customer sends, and where |
| `depositAddress` | `String!` | Where to send it |
| `depositMemo` | `String` | Required when present |
| `amountIn`, `amountInFormatted` | `String!` | Amount to send, in base units and whole units |
| `amountOut` | `String!` | USDC delivered, in base units |
| `network`, `token` | `String!` | `base` and `USDC` |
| `recipient` | `String!` | The merchant's wallet |
| `refundAddress` | `String!` | Where a refund goes |
| `deadline` | `DateTime!` | Send before this time. 30 minutes for XLM, 60 for BTC |
| `fundableUntil` | `DateTime!` | The last moment a late deposit can still be converted |
| `timeEstimateSeconds` | `Int` | Estimated conversion time |
| `originTransactions` | `[CrossChainTx!]!` | Deposits, each with `hash` and `explorerUrl` |
| `destinationTransaction` | `CrossChainTx` | The USDC delivery to the merchant |
| `refundedAmount`, `refundReason` | `String` | Set when refunded |
| `paidLate` | `Boolean!` | The deposit arrived after `deadline` and still completed |

| Status | Meaning |
| --- | --- |
| `quoted` | Waiting for the deposit |
| `deposit_seen` | The deposit was detected |
| `processing` | The conversion is running |
| `incomplete` | Less than the required amount arrived |
| `delivered` | Delivery reported. KwesPay is verifying it on Base |
| `settled` | KwesPay verified the USDC on Base. Final |
| `refunded` | Returned to `refundAddress`. Final |
| `failed` | The conversion failed. Final |
| `expired` | No deposit arrived in time. Final |

## `submitCrossChainDeposit`

```graphql
mutation SubmitCrossChainDeposit($transactionReference: String!, $txHash: String!) {
  submitCrossChainDeposit(transactionReference: $transactionReference, txHash: $txHash)
}
```

Tells the conversion service about a deposit so it can be picked up sooner. Returns `true` when the hint is accepted. It is optional: deposits are detected without it, and it never marks a payment as paid.
