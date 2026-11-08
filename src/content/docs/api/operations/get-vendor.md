---
title: getVendor
description: Reference for the getVendor query, which returns a merchant's public payment configuration, including enabled networks, accepted tokens and wallet availability.
sidebar:
  order: 6
---

```graphql
query GetVendor($vendorIdentifier: String!) {
  getVendor(vendorIdentifier: $vendorIdentifier): Vendor
}
```

| | |
| --- | --- |
| Type | Query |
| Auth | None |
| SDK | [`getMerchantConfig()`](/sdk/methods/#getmerchantconfig) |

Returns the merchant's payment configuration, or `null` if the vendor ID does not exist.

## Fields used by integrations

| Field | Type | Description |
| --- | --- | --- |
| `vendorIdentifier` | `String!` | Vendor ID |
| `businessName` | `String!` | Display name |
| `acceptedCurrencies` | `[String!]!` | Token symbols the merchant accepts |
| `enabledNetworks` | `[String!]!` | Network keys the merchant has enabled |
| `hasEvmWallet` | `Boolean!` | An EVM receiving wallet is set |
| `hasSuiWallet` | `Boolean!` | A Sui receiving wallet is set |
| `hasStellarWallet` | `Boolean!` | A Stellar receiving wallet is set |
| `activeStatus` | `Boolean!` | The merchant can accept payments |
| `crossChainNetworks` | `[String!]!` | Networks that can receive [payments from other assets](/api/operations/cross-chain-payments/) |

A network is usable only when it is enabled, the merchant has a wallet of its family, and at least one accepted token is offered on it. `getMerchantConfig()` in the SDK computes this for you.

## Example

```graphql
query {
  getVendor(vendorIdentifier: "YOUR_VENDOR_ID") {
    businessName
    acceptedCurrencies
    enabledNetworks
    hasEvmWallet
    hasStellarWallet
    activeStatus
  }
}
```

An unknown vendor ID returns `{ "data": { "getVendor": null } }`.
