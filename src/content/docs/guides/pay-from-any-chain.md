---
title: Pay from any chain
description: Let customers pay with XLM or BTC while the merchant receives USDC on Base. NEAR Intents converts the payment and KwesPay verifies the delivery on-chain.
sidebar:
  order: 4
---

Customers can pay with an asset the merchant doesn't accept. A merchant who receives USDC on Base can be paid in **XLM** or **BTC**. [NEAR Intents](https://near-intents.org) converts the payment and delivers USDC to the merchant's wallet. KwesPay checks that delivery on Base before it marks the order paid.

| Pay with | Merchant receives | Minimum | Typical time |
| --- | --- | --- | --- |
| XLM (Stellar) | USDC on Base | $1 | About 30 seconds |
| BTC (Bitcoin) | USDC on Base | $20 | About 15 minutes |

## Turn it on

In the dashboard, open the business and switch on **Accept XLM or BTC** under **Payments from other chains**. The business needs Base enabled, an EVM wallet and USDC accepted. The merchant's settings decide where the money goes: it is always USDC, on Base, to the business's wallet.

## In the widget

Nothing to change in your code. Once it's on, the widget shows **Pay with XLM or BTC** under the networks.

1. The customer picks XLM or BTC and sees the live price.
2. With XLM they can **connect a Stellar wallet** (Freighter, Lobstr, xBull, Albedo). The amount and memo are filled in and they approve one payment. Or they send from an exchange or any app using the address, memo and QR code shown.
3. With BTC they send to the deposit address shown.
4. The widget follows the payment through conversion and shows the receipt.

The result has the usual shape, with `network: "base"`, `token: "USDC"` and a `paidWith` field. See [Checkout widget](/guides/checkout-widget/).

## With the SDK

```ts
const config = await kwespay.getMerchantConfig("YOUR_VENDOR_ID");

if (config.crossChainNetworks.includes("base")) {
  const { quote, options } = await kwespay.getCrossChainOptions({
    amount: 25, currency: "USD", token: "USDC", network: "base",
  });

  const result = await kwespay.checkoutFromAnotherAsset({
    quote,
    originAsset: "XLM",
    wallet: stellarWallet,
    orderId: "A-1042",
    onStatus: (title, detail) => setProgress(title, detail),
  });
}
```

- `options` lists each asset with its live price, time estimate and minimum.
- Pass a Stellar `wallet` (the same adapter as [Stellar payments](/guides/javascript-sdk/)) and the SDK sends the deposit for you, refunding to that wallet if needed.
- Without a wallet, pass `refundAddress` and use `onDeposit(route)` to show `route.depositAddress`, `route.depositMemo` and `route.amountInFormatted`.
- `result.paid` is `true` once KwesPay has verified the USDC on Base.

Lower-level steps: `payFromAnotherAsset()`, `sendCrossChainDeposit()`, `getPaymentRoute()`, `pollPaymentRoute()`. See [Methods](/sdk/methods/#pay-from-another-asset).

## Confirming the order

Nothing changes on your server. [Webhooks](/guides/webhooks/) and [`verifyPayment()`](/guides/payment-confirmation/) report these payments like any other: `network` is `base`, `token` is `USDC` and `blockchainHash` is the delivery to the merchant.

## Good to know

- **Memo.** XLM deposits go to a shared address and are matched by the memo. Connected wallets add it automatically. When sending manually, the customer must include it.
- **Refunds.** If a conversion can't complete, for example the deposit was too small, it's returned to the customer's refund address.
- **Late deposits.** A deposit that arrives after the countdown is still converted and completes the order.
- **Fees.** The customer pays the conversion and KwesPay fee in the asset they send. The merchant receives the full invoice amount in USDC.
