---
title: Error handling
description: How KwesPay reports failures in the SDK, the widget and the GraphQL API, and how to recover from expired quotes, wallet rejections, network mismatches and API errors.
sidebar:
  order: 7
---

Failures come from three places: the KwesPay API, the customer's wallet and the chain. The SDK turns all of them into a `KwesPayError` with a `code`.

```ts
import { KwesPayError } from "@kwespay/client";

try {
  const payload = await kwespay.quote(params);
  await kwespay.pay({ provider, payload, onStatus });
} catch (err) {
  if (!(err instanceof KwesPayError)) throw err;

  switch (err.code) {
    case "WALLET_REJECTED":
    case "APPROVAL_REJECTED":
      showMessage("Payment cancelled in your wallet.");
      break;
    case "INSUFFICIENT_BALANCE":
      showMessage("Not enough funds for the payment and network fee.");
      break;
    case "QUOTE_EXPIRED":
    case "QUOTE_USED":
      showMessage("The price expired. Please try again.");
      break;
    case "NETWORK_NOT_ENABLED":
    case "TOKEN_NOT_SUPPORTED":
    case "MERCHANT_NOT_FOUND":
      reportConfigurationProblem(err);
      break;
    default:
      reportError(err.code, err.message);
  }
}
```

The full list is in [SDK error codes](/sdk/errors/).

## Recovering from common failures

| Situation | Code | What to do |
| --- | --- | --- |
| The customer declined in the wallet | `WALLET_REJECTED`, `APPROVAL_REJECTED` | Let them try again with the same payload if it has not expired |
| Quote older than 10 minutes | `QUOTE_EXPIRED` | Call `quote()` again. Never reuse quote IDs |
| Quote already turned into a transaction | `QUOTE_USED` | Call `quote()` again |
| Wallet on another chain and switching failed | `WRONG_NETWORK` | Ask the customer to add or select the network in their wallet |
| Not enough tokens or gas | `INSUFFICIENT_BALANCE` | Show the required amount from `totalBaseUnits` and the network's fee token |
| Network not enabled for the merchant | `NETWORK_NOT_ENABLED` | Enable it in the dashboard, or stop offering it. Use `getMerchantConfig()` to build your options |
| Token not available for the merchant or network | `TOKEN_NOT_SUPPORTED` | As above |
| API unreachable or HTTP error | `NETWORK_ERROR` | Retry with backoff. HTTP 429 means you exceeded 200 requests per minute |
| On-chain call reverted or timed out | `CONTRACT_ERROR` | Read `err.message`. Do not retry the same payload if the transaction may have been mined. Check the status first |

## Errors from the GraphQL API

The API reports problems in two ways. See [API errors](/api/errors/).

- `createQuote` and `createTransaction` always return data. Failures come back as `success: false` with a human-readable `message`.
- Other operations, such as `getTransactionStatus` and `submitTransactionHash`, return a GraphQL `errors` array, for example `Transaction not found`.

The SDK maps `message` text to codes by keyword, so treat `err.message` as the detail and `err.code` as the category. Show your own wording to customers.

## Do not double-charge

If `pay()` throws after the wallet broadcast the transaction, for example a timeout while waiting for the receipt, the payment may still succeed. Before you let the customer pay again:

1. Read the status of `payload.transactionReference`.
2. If it is `processing`, wait and check again.
3. Only start a new quote if the transaction never reached the chain, or the status is `expired` or `failed` and its `blockchainHash` shows no successful payment.

The contract rejects a second payment with the same payment ID, so retrying the **same** payload cannot charge twice. A **new** quote can.
