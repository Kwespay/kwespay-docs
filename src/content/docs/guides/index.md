---
title: Choosing an integration
description: Compare the KwesPay HTML embed, the checkout widget, the JavaScript SDK and the GraphQL API, and pick the one that fits your checkout.
sidebar:
  label: Integration overview
  order: 1
---

Every integration uses the same API, signed terms and contracts. They differ only in how much interface you want to build. Most merchants need the first or second option.

| | HTML embed | Checkout widget | JavaScript SDK | GraphQL API |
| --- | --- | --- | --- | --- |
| Package | `@kwespay/widget` script tag | `@kwespay/widget` | `@kwespay/client` | None |
| You write | HTML attributes | One `kwespay()` call | Your own interface plus one `checkout()` call | Every request |
| Wallet connection | Included | Included | You pass a wallet | You build it |
| Chains | EVM, Stellar, Sui testnet | EVM, Stellar, Sui testnet | EVM, Stellar, Sui testnet | EVM, Stellar, Sui testnet |

## How to choose

**Use the HTML embed** for a website, a CMS or a static page. Paste the script tag with your API key and put `data-kwespay-amount` on a button. See [Quickstart](/getting-started/quickstart/).

**Use the widget** when your page already has JavaScript and you want the result in code. See [Checkout widget](/guides/checkout-widget/).

**Use the SDK** when you want your own checkout design or already manage wallets, for example with wagmi. See [JavaScript SDK](/guides/javascript-sdk/).

**Use the GraphQL API** from a server language without an SDK. See the [API reference](/api/).

Every option above can also take [payments from other chains](/guides/pay-from-any-chain/): customers pay with XLM or BTC and the merchant receives USDC on Base.

## Confirming payments

Whichever option you pick, fulfil orders from your server: receive signed [webhooks](/guides/webhooks/), or call [`verifyPayment`](/guides/payment-confirmation/), which checks the on-chain status, the order, the amount and the currency for you. Nothing redirects the customer away from your page.
