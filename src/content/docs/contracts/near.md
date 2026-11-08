---
title: NEAR contract
description: The KwesPay NEAR payment contract, including token and native NEAR payments, the Ed25519 authorization message, fees, events and held payouts.
sidebar:
  order: 4
---

The NEAR contract is written in Rust with `near-sdk`. It is deployed on testnet at `pay.kwespay.testnet` with a 1% fee. Source: [Kwespay/Kwespay-near](https://github.com/Kwespay/Kwespay-near).

## Paying

**Tokens (USDC, USDC.e, USDT).** The customer calls `ft_transfer_call` on the token with `receiver_id` set to the KwesPay contract and `msg` set to the signed terms. Attach 100 TGas. The contract keeps `amount + fee` and refunds anything extra.

**Native NEAR.** The customer calls `pay_near({ "args": <terms> })` with at least `amount + fee` attached. Any excess is refunded.

```json
{ "payment_id": "<64 hex>", "vendor_id": "vend-a", "vendor_wallet": "shop.near",
  "amount": "1000000", "deadline_ms": "1760000900000", "signature": "<128 hex>" }
```

`amount` is the merchant amount in base units. The SDK's [`pay()`](/sdk/methods/#pay) builds both calls for you.

## Delivery through NEAR Intents

The contract also accepts tokens delivered by `intents.near`, using the same code as a wallet payment. Intents calls `ft_withdraw` with `receiver_id` set to the KwesPay contract and `msg` set to the signed terms. The token then calls `ft_on_transfer`, and the contract applies the usual signature check, fee and `payment_completed` event.

The sender is `intents.near`, so the terms must be signed with `customer` set to `intents.near`.

| Delivery | Result |
| --- | --- |
| Valid | The merchant receives the amount and KwesPay the fee. The payment is recorded with `customer = intents.near` |
| Expired, wrong customer, underpaid or already paid | The full amount returns to the sender's Intents balance. Merchant and fee are untouched |
| Overpaid | The merchant is paid exactly and only the excess returns |

These cases run in the contract's integration tests against the deployed `intents.near` code in a NEAR sandbox. `intents.near` exists only on mainnet and this contract is deployed only on testnet, so they are not exercised on a live network.

[Hosted cross-chain checkout](/guides/pay-from-any-chain/) doesn't use this path today. It delivers directly to the merchant's wallet, and KwesPay verifies that transfer before marking the payment complete.

## Authorization message

`signature = Ed25519(backend_key, SHA-256(message))`. Variable-length fields are a big-endian `u16` length followed by UTF-8 bytes.

| # | Field | Encoding |
| --- | --- | --- |
| 1 | Domain | `u16_be(len)` and `kwespay_payment_near_v1` |
| 2 | `payment_id` | 32 raw bytes |
| 3 | `vendor_id` | `u16_be(len)` and UTF-8 |
| 4 | `vendor_wallet` | `u16_be(len)` and the account ID |
| 5 | `token` | `u16_be(len)` and the token account ID, or `NEAR` |
| 6 | `amount` | `u128`, 16 bytes big-endian |
| 7 | `deadline_ms` | `u64`, 8 bytes big-endian, Unix milliseconds |
| 8 | `customer` | `u16_be(len)` and the paying account ID |
| 9 | `contract` | `u16_be(len)` and the contract account ID |
| 10 | `network` | `u16_be(len)` and `mainnet` or `testnet` |

Because the customer, contract and network are signed, an authorization works for one payer, on one contract, on one network.

## Fees

`fee = amount × platform_fee_bps ÷ 10000`, rounded down. Read the live rate with `get_config`, or exact figures with `compute_fee` and `compute_total`. See [Fee model](/contracts/fee-model/).

## Events

The contract emits NEP-297 logs (`EVENT_JSON:`, standard `kwespay`). `payment_completed` is final settlement. `payout_failed` and `withdrawal_started` cover held payouts. Every admin change also emits an event.

## Held payouts

NEAR payouts are asynchronous. If a merchant's wallet can't receive a token yet (for example, it isn't storage-registered), the payout is held for that merchant instead of being lost. Anyone can then call `withdraw`, which only ever pays the rightful merchant. KwesPay registers merchant wallets on every supported token when it registers the merchant, so this is rare.

## Administration

Admin methods require a full-access key (1 yoctoNEAR attached). Fee increases wait 24 hours and are capped at 10%. The contract has no admin withdrawal and no upgrade path in its code.
