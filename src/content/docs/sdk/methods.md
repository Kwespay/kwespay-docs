---
title: KwesPayClient methods
description: Reference for every public method on KwesPayClient, with parameters, return types, errors and the GraphQL operations each method calls.
sidebar:
  order: 3
---

All methods are `async` and throw [`KwesPayError`](/sdk/errors/) on failure unless stated otherwise.

| Method | Calls | Needs a wallet |
| --- | --- | --- |
| [`checkout()`](#checkout) | Everything below, in order | Yes |
| [`verifyPayment()`](#verifypayment) | `verifyPayment` | No |
| [`verifyWebhook()`](#verifywebhook) | Nothing. Runs locally | No |
| [`validateKey()`](#validatekey) | `validateAccessKey` | No |
| [`getMerchantConfig()`](#getmerchantconfig) | `getVendor`, `paymentNetworks` | No |
| [`getNetworks()`](#getnetworks) | `paymentNetworks` | No |
| [`checkoutFromAnotherAsset()`](#pay-from-another-asset) | `createQuote`, `crossChainOptions`, `createCrossChainPayment`, `paymentRoute` | Optional |
| [`getQuote()`](#getquote) | `createQuote` | No |
| [`quote()`](#quote) | `createQuote`, `createTransaction` | No |
| [`pay()`](#pay) | Wallet, contract, `submitTransactionHash` | Yes |
| [`submitTransactionHash()`](#submittransactionhash) | `submitTransactionHash` | No |
| [`getTransactionStatus()`](#gettransactionstatus) | `getTransactionStatus` | No |
| [`pollTransactionStatus()`](#polltransactionstatus) | `getTransactionStatus`, repeatedly | No |

## checkout()

```ts
checkout(params: CheckoutParams): Promise<CheckoutResult>
```

Prices the payment, creates the signed transaction, checks the balance, runs the wallet flow and waits for KwesPay's final status.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | `number` | Yes | Price in fiat |
| `currency` | `string` | No | ISO 4217 code. Default `USD` |
| `token` | `TokenSymbol` | Yes | Token to pay with |
| `network` | `NetworkKey` | Yes | Network key |
| `orderId` | `string` | No | Your order ID, checked later by `verifyPayment()` |
| `provider` | `EIP1193Provider` | EVM | The customer's wallet |
| `wallet` | `StellarWalletAdapter`, `SuiWalletAdapter` or `NearWalletAdapter` | Stellar, Sui, NEAR | The customer's wallet |
| `vendorIdentifier` | `string` | No | Only needed when the key can access more than one merchant |
| `payerWalletAddress` | `string` | No | Read from the wallet when omitted |
| `onStatus` | `(title, detail) => void` | No | Progress callback |

Resolves with `{ paid, status, transactionReference, txHash, orderId, network, token, cryptoAmount }`. `paid` is `true` for `completed` and `overpaid`. If confirmation takes longer than polling allows, it resolves with the latest status, for example `processing`, rather than rejecting. Throws `WALLET_REJECTED` when no wallet is given for the network's family.

## verifyPayment()

```ts
verifyPayment(
  transactionReference: string,
  options: { amount: number; currency: string; orderId?: string },
): Promise<VerifyPaymentResult>
```

For your server. Resolves with `paid: true` only when KwesPay confirmed the payment on-chain and it matches the order ID, amount and currency. Otherwise `reason` explains why. See [Payment confirmation](/guides/payment-confirmation/).

Result fields: `paid`, `reason`, `transactionReference`, `status`, `orderId`, `fiatAmount`, `fiatCurrency`, `token`, `cryptoAmount`, `network`, `txHash`, `vendorIdentifier`, `initiatedAt`.

## verifyWebhook()

```ts
import { verifyWebhook } from "@kwespay/client";

verifyWebhook(
  rawBody: string | Uint8Array,
  signatureHeader: string | null | undefined,
  secret: string,
  options?: { toleranceSeconds?: number; now?: number },
): Promise<WebhookEvent>
```

A standalone function, not a client method. Checks the `KwesPay-Signature` header against the raw request body and your endpoint secret, rejects timestamps more than `toleranceSeconds` (default 300) from now, and returns the parsed event. Throws `WEBHOOK_SIGNATURE_INVALID` otherwise. See [Webhooks](/guides/webhooks/).

## validateKey()

```ts
validateKey(vendorIdentifier?: string): Promise<ValidateKeyResponse>
```

Checks the client's API key. Returns `{ isValid: false, error }` for a rejected key instead of throwing.

When valid, the result has `keyId`, `keyLabel`, `activeFlag`, `expirationDate`, `vendorInfo` and `scope`. `scope` contains `allowedVendors`, `allowedNetworks`, `allowedTokens` and `isAuthorizedForVendor`.

`isAuthorizedForVendor` is set only when you pass `vendorIdentifier`, and is a best-effort answer: `null` means it could not be confirmed from this call. The real check happens when you request a quote.

## getMerchantConfig()

Requires 0.1.27 or later.

```ts
getMerchantConfig(vendorIdentifier: string): Promise<MerchantConfig>
```

Returns the networks and tokens a merchant can actually be paid with. A network is included only if the merchant enabled it, has a receiving wallet of its family, and accepts at least one token KwesPay offers on it.

```ts
const config = await kwespay.getMerchantConfig("YOUR_VENDOR_ID");
// config.networkTokenMap: [{ network: "base", tokens: ["USDC", "USDT"], family: "evm" }, …]
```

Throws `MERCHANT_NOT_FOUND` if the vendor ID is empty, unknown or inactive.

## getNetworks()

Requires 0.1.28 or later.

```ts
getNetworks(): Promise<PaymentNetwork[]>
```

Returns every network the API offers, with its contract, platform fee, public RPC, explorer and tokens. The SDK uses this list to resolve contracts and RPCs, so you don't need to keep your own. The result is cached for the life of the client.

```ts
interface PaymentNetwork {
  key: string;
  name: string;
  environment: "mainnet" | "testnet";
  ecosystem: "evm" | "sui" | "stellar" | "near";
  chainId: number | null;
  contractAddress: string | null;
  registryObjectId: string | null;
  platformFeeBps: number;
  explorerTxUrl: string | null;
  publicRpcUrl: string | null;
  nativeSymbol: string | null;
  networkPassphrase: string | null;
  logoUrl: string | null;
  tokens: { symbol: string; displaySymbol: string; name: string; logoUrl: string | null;
            address: string; decimals: number; isNative: boolean }[];
}
```

`getNetwork(key)` returns one entry and throws `NETWORK_NOT_ENABLED` if the API doesn't offer it.

## getQuote()

```ts
getQuote(params: QuoteParams): Promise<QuoteResult>
```

Calls `createQuote` only. Use it to show a price before the customer connects a wallet. The result cannot be paid directly. Pass the same parameters to `quote()` when the customer is ready.

## quote()

```ts
quote(params: QuoteParams): Promise<TransactionPayload>
```

Creates a quote and a signed transaction, and returns the payload for `pay()`.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `vendorIdentifier` | `string` | No | Only needed when the key can access more than one merchant |
| `fiatAmount` | `number` | Yes | Fiat amount to charge |
| `fiatCurrency` | `string` | No | ISO 4217 code. Default `USD` |
| `cryptoCurrency` | `TokenSymbol` | Yes | Token to pay with |
| `network` | `NetworkKey` | Yes | Network key |
| `payerWalletAddress` | `string` | Yes in practice | The paying wallet. The API rejects an empty value. On NEAR the signature binds this account |
| `orderId` | `string` | No | Your order ID, up to 128 printable characters |

The payload expires with the transaction after 15 minutes. Throws `QUOTE_EXPIRED`, `NETWORK_NOT_ENABLED`, `TOKEN_NOT_SUPPORTED`, `MERCHANT_NOT_FOUND`, `INVALID_KEY` or `UNKNOWN` depending on the API's message. See [API errors](/api/errors/).

## pay()

```ts
pay(params: EVMPayParams | StellarPayParams | SuiPayParams | NearPayParams): Promise<PaymentResult>
```

Runs the payment in the customer's wallet and resolves when the transaction is on-chain. It then reports the hash with `submitTransactionHash()`, ignoring any error from that call.

| Parameter | Type | Description |
| --- | --- | --- |
| `payload` | `TransactionPayload` | From `quote()`. Do not modify it |
| `provider` | `EIP1193Provider` | EVM networks |
| `wallet` | `StellarWalletAdapter`, `SuiWalletAdapter` or `NearWalletAdapter` | Stellar and Sui (0.1.27), NEAR (0.1.28) |
| `onStatus` | `(title, detail) => void` | Progress callback. See [JavaScript SDK](/guides/javascript-sdk/#show-progress) |
| `contractId` | `string` | Stellar and NEAR. Overrides the contract ID |
| `registryObjectId` | `string` | Sui only. Overrides the registry object |

On EVM networks `pay()`:

1. switches the wallet to the payload's chain with `wallet_switchEthereumChain`;
2. checks the native and token balance;
3. for ERC-20 tokens, reads the allowance and, if it is below the total, requests `approve` for exactly the payment total, then waits for it;
4. sends `createPayment` to `payload.contractAddress` and waits for the receipt.

On NEAR `pay()` checks that the connected account is the one the payment was signed for, checks the balance, then calls `pay_near` for native NEAR or `ft_transfer_call` on the token. A transfer the contract refunds is reported as `CONTRACT_ERROR` with the contract's reason. See [NEAR contract](/contracts/near/).

Returns:

```ts
interface PaymentResult {
  txHash: string;
  transactionReference: string;
  paymentIdBytes32: string;
  blockNumber: number;
}
```

`blockNumber` is the block number on EVM, the checkpoint on Sui and the ledger sequence on Stellar. It is `0` on NEAR.

## submitTransactionHash()

Requires 0.1.27 or later.

```ts
submitTransactionHash(transactionReference: string, txHash: string): Promise<void>
```

Reports a transaction hash. `pay()` calls it for you. Use it to recover when a payment was broadcast but the page closed before `pay()` finished.

## getTransactionStatus()

```ts
getTransactionStatus(transactionReference: string): Promise<TransactionStatusResult>
```

Reads the current status once. See [`getTransactionStatus`](/api/operations/get-transaction-status/) for the fields.

## pollTransactionStatus()

```ts
pollTransactionStatus(
  transactionReference: string,
  options?: {
    onStatus?: (status: TransactionStatus) => void;
    intervalMs?: number;
    maxAttempts?: number;
  },
): Promise<TransactionStatusResult>
```

Calls `getTransactionStatus` every `intervalMs` (default 2000) until the status is `completed`, `failed`, `expired`, `underpaid`, `overpaid` or `refunded`. After `maxAttempts` (default 150) it rejects with code `UNKNOWN`. A timeout does not mean the payment failed.

## Pay from another asset

Requires 0.1.29 or later. See [Pay from any chain](/guides/pay-from-any-chain/).

```ts
getCrossChainOptions(params: CrossChainPriceParams | { quote: QuoteResult }): Promise<{ quote: QuoteResult; options: CrossChainOption[] }>
checkoutFromAnotherAsset(params: CrossChainCheckoutParams): Promise<CrossChainCheckoutResult>
payFromAnotherAsset(params: { quoteId; originAsset; refundAddress }): Promise<PaymentRoute>
sendCrossChainDeposit(params: { route; wallet: StellarWalletAdapter; onStatus? }): Promise<{ txHash: string }>
getPaymentRoute(transactionReference: string): Promise<PaymentRoute>
pollPaymentRoute(transactionReference: string, options?: { onRoute?; intervalMs?; timeoutMs? }): Promise<PaymentRoute>
submitCrossChainDeposit(transactionReference: string, txHash: string): Promise<boolean>
```

`checkoutFromAnotherAsset()` takes a `quote` (or `amount`, `token`, `network`), the `originAsset` from `getCrossChainOptions()`, and either a supported `wallet` or a `refundAddress`. It calls `onDeposit(route)` with the deposit details, `onStatus(title, detail)` as the payment moves, and resolves like `checkout()` with an extra `route`.

A `PaymentRoute` has `status` (`quoted`, `deposit_seen`, `processing`, `incomplete`, `delivered`, `settled`, `refunded`, `failed`, `expired`), `transactionStatus`, `depositAddress`, `depositMemo`, `amountInFormatted`, `originTransactions`, `destinationTransaction`, `deadline` and refund details.

Errors: `CROSS_CHAIN_UNAVAILABLE`, `AMOUNT_BELOW_MINIMUM`, `INVALID_REFUND_ADDRESS`, `QUOTE_EXPIRED`, `INSUFFICIENT_BALANCE` and `WALLET_REJECTED`.
