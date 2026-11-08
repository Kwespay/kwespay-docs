---
title: Merchant dashboard
description: What merchants configure in the KwesPay dashboard, including sign-up, businesses, receiving wallets, enabled networks, accepted tokens, API keys and payment history.
sidebar:
  order: 1
---

The merchant dashboard is where a business sets up everything the API reads when it prices and signs a payment. It is a separate application for each environment:

| Environment | Dashboard |
| --- | --- |
| Mainnet | [app.kwespay.xyz](https://app.kwespay.xyz) |
| Testnet | [app.testnet.kwespay.xyz](https://app.testnet.kwespay.xyz) |

## What you manage

**Account.** Sign up with your email and a password of at least 8 characters. KwesPay emails a 6-digit code, valid for 10 minutes, and the account is created only once you enter it. You can request a new code after 60 seconds. One account can own several businesses.

**Businesses.** After sign-up, the setup flow creates your first business. Each business has a name and a vendor ID. Its configuration decides what customers can pay with:

- **Receiving wallets**, one per chain family: EVM, Sui, Stellar and NEAR. Payments on a network go to the wallet of its family.
- **Enabled networks**. A business can only be paid on networks it enables. You can turn on up to 6 networks at a time, and each one is registered on-chain.
- **Accepted tokens**. Only these tokens are offered and quoted.

**Payment links.** Shareable checkout pages that need no code. See [Payment links](/merchants/payment-links/).

**Payments from other chains.** Let customers pay with any token NEAR Intents supports while you receive the asset you accept. See [Pay from any chain](/guides/pay-from-any-chain/).

**API keys.** Create keys for your integrations, optionally limited to certain networks and tokens, and deactivate keys you no longer use. See [Authentication](/api/authentication/).

**Payments.** A history of the merchant's transactions with their status, amount, token, network and transaction hash. Use it with the transaction reference to reconcile orders.

## How dashboard settings reach the chain

KwesPay registers each merchant's receiving wallet in the payment contracts, which is what lets the contract pay the merchant directly.

## Payments you can trust

- Payments are already in the merchant's own wallet. The dashboard shows them; it never holds them.
- Statuses such as `completed`, `underpaid` and `overpaid` come only from verified on-chain data, so what you see is what the chain recorded.
