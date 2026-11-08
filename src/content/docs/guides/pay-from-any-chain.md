---
title: Pay from any chain
description: Let customers pay with any token NEAR Intents supports while the merchant receives the asset they accept. KwesPay verifies the delivery on-chain.
sidebar:
  order: 4
---

Customers can pay with any token [NEAR Intents](https://near-intents.org) supports, whether or not the merchant accepts it. NEAR Intents converts the payment and delivers the asset the merchant accepts to the merchant's wallet. KwesPay checks that delivery on-chain before it marks the order paid.

## Turn it on

In the dashboard, open the business and switch on **Payments from other chains**. The business needs a wallet on the network it receives on, with that token accepted. The merchant's settings decide where the money goes: it always arrives in the merchant's asset, in the merchant's wallet.

## In the widget

Nothing to change in your code. Once it's on, the widget offers paying with another token alongside the networks.

1. The customer picks a token and sees the live price.
2. They connect a supported wallet and approve one payment, or send from an exchange or any app using the address and QR code shown.
3. The widget follows the payment through conversion and shows the receipt.

The result has the usual shape: `network` and `token` are what the merchant received, and `paidWith` is what the customer sent. See [Checkout widget](/guides/checkout-widget/).

## With the SDK

```ts
const config = await kwespay.getMerchantConfig("YOUR_VENDOR_ID");
const [network] = config.crossChainNetworks;

if (network) {
  const { quote, options } = await kwespay.getCrossChainOptions({
    amount: 25, currency: "USD", token: "YOUR_TOKEN", network,
  });
  const option = options.find((o) => o.available);

  const result = await kwespay.checkoutFromAnotherAsset({
    quote,
    originAsset: option.originAsset,
    refundAddress: customerAddress,
    orderId: "A-1042",
    onDeposit: (route) => showDeposit(route),
    onStatus: (title, detail) => setProgress(title, detail),
  });
}
```

- `options` lists each token with its live price, time estimate and minimum.
- `onDeposit(route)` gives you `route.depositAddress`, `route.depositMemo` and `route.amountInFormatted` to show the customer.
- `refundAddress` is the customer's address on the chain they pay from.
- `result.paid` is `true` once KwesPay has verified the delivery to the merchant.

Lower-level steps: `payFromAnotherAsset()`, `sendCrossChainDeposit()`, `getPaymentRoute()`, `pollPaymentRoute()`. See [Methods](/sdk/methods/#pay-from-another-asset).

## Confirming the order

Nothing changes on your server. [Webhooks](/guides/webhooks/) and [`verifyPayment()`](/guides/payment-confirmation/) report these payments like any other: `network` and `token` are what the merchant received, and `blockchainHash` is the delivery to the merchant.

## Good to know

- **Memo.** Some deposits go to a shared address and are matched by a memo. When `needsMemo` is `true`, the customer must include it. Connected wallets add it automatically.
- **Refunds.** If a conversion can't complete, for example the deposit was too small, it's returned to the customer's refund address.
- **Late deposits.** A deposit that arrives after the countdown is still converted and completes the order.
- **Fees.** The customer pays the conversion and KwesPay fee in the token they send. The merchant receives the full invoice amount.
