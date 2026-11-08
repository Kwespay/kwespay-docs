(() => {
	const params = new URLSearchParams(location.search);
	const scenario = params.get('scenario') || 'success';
	const ZERO = '0x0000000000000000000000000000000000000000';
	const ACCOUNT = '0x7e57000000000000000000000000000000000001';
	const API_HOST = 'kwespay.xyz';
	const NEAR_RPC = 'https://rpc.testnet.near.org';
	const NEAR_ACCOUNT = 'kwespay-test-wallet.testnet';
	const NEAR_NATIVE = 'NEAR';

	const NETWORKS = {
		ethereum: { chainId: 1, name: 'Ethereum' },
		polygon: { chainId: 137, name: 'Polygon' },
		base: { chainId: 8453, name: 'Base' },
		lisk: { chainId: 1135, name: 'Lisk' },
		mezo: { chainId: 31612, name: 'Mezo' },
		arbitrum: { chainId: 42161, name: 'Arbitrum One' },
		sepolia: { chainId: 11155111, name: 'Sepolia' },
		baseSepolia: { chainId: 84532, name: 'Base Sepolia' },
		polygonAmoy: { chainId: 80002, name: 'Polygon Amoy' },
		arbitrumSepolia: { chainId: 421614, name: 'Arbitrum Sepolia' },
		liskTestnet: { chainId: 4202, name: 'Lisk Sepolia' },
		mezoTestnet: { chainId: 31611, name: 'Mezo Testnet' },
		nearTestnet: { chainId: null, name: 'NEAR Testnet' },
	};

	const TOKENS = {
		ethereum: { ETH: [ZERO, 18], USDT: ['0xdAC17F958D2ee523a2206206994597C13D831ec7', 6], USDC: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6], DAI: ['0x6B175474E89094C44Da98b954EedeAC495271d0F', 18] },
		polygon: { MATIC: [ZERO, 18], USDT: ['0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6], USDC: ['0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', 6] },
		base: { ETH: [ZERO, 18], USDC: ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6], USDBC: ['0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', 6] },
		lisk: { ETH: [ZERO, 18], LSK: [ZERO, 18] },
		mezo: { MEZO: [ZERO, 18], USDT: ['0xd16c9c341Bc15B5db7E25881893CA5a3117bB9A5', 6] },
		arbitrum: { ETH: [ZERO, 18], USDC: ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6], USDT: ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6] },
		sepolia: { ETH: [ZERO, 18], MUSD: ['0xeB5a5d39dE4Ea42C2Aa6A57EcA2894376683bB8E', 18], USDC: ['0xeB5a5d39dE4Ea42C2Aa6A57EcA2894376683bB8E', 6] },
		baseSepolia: { ETH: [ZERO, 18], USDC: ['0x036CbD53842c5426634e7929541eC2318f3dCF7e', 6] },
		polygonAmoy: { MATIC: [ZERO, 18], USDC: ['0x8B0180f2101c8260d49339abfEe87927412494B4', 6] },
		arbitrumSepolia: { ETH: [ZERO, 18], USDC: ['0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', 6], ARB: ['0x15dd68a7a37d7edBf284b93Bc25d6b286d33fCc3', 18] },
		liskTestnet: { ETH: [ZERO, 18], LSK: ['0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D', 18] },
		mezoTestnet: { MEZO: ['0x7B7c000000000000000000000000000000000001', 18], USDT: ['0xd16c9c341Bc15B5db7E25881893CA5a3117bB9A5', 6] },
		nearTestnet: { NEAR: [NEAR_NATIVE, 24], USDC: ['3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af', 6], 'USDC.E': ['usdc.fakes.testnet', 6], USDT: ['usdt.fakes.testnet', 6] },
	};

	const CONTRACTS = {
		sepolia: '0xEC2f1C7138921C28802A7Bd2b7098D99B3330b33',
		baseSepolia: '0x3d7A6a7aD72374D2d3dca4e97053bAbFA6E49ec0',
		polygonAmoy: '0xEb40935599d5D8ef39C1aAE38E7A1f6d9c89B3fF',
		arbitrumSepolia: '0xf141a81298E0890E8b347f505BfA028a14253030',
		liskTestnet: '0x3378B6074A9DA47Aef8b7C849aFcaF58b8D8134b',
		mezoTestnet: '0x67f3Df6B5BE714303F397104d8F2A3861b9E8b6d',
		nearTestnet: 'pay.kwespay.testnet',
	};

	const IMG = 'https://arthuremma2.github.io/img-hosting/';
	const USDC_LOGO = 'https://move-flow.github.io/assets/usd-coin-usdc-logo.svg';
	const USDT_LOGO = 'https://move-flow.github.io/assets/tether-usdt-logo.svg';
	const NEAR_LOGO = 'https://assets.coingecko.com/coins/images/10365/large/near.jpg';
	const NETWORK_LOGOS = {
		ethereum: IMG + 'ethereum-eth.svg',
		sepolia: IMG + 'ethereum-eth.svg',
		polygon: IMG + 'Polygon_Icon.png',
		polygonAmoy: IMG + 'Polygon_Icon.png',
		base: IMG + 'base23.png',
		baseSepolia: IMG + 'base23.png',
		lisk: IMG + 'liskt.png',
		liskTestnet: IMG + 'liskt.png',
		mezo: IMG + 'mezo.png',
		mezoTestnet: IMG + 'mezo.png',
		arbitrum: IMG + 'arb44.svg',
		arbitrumSepolia: IMG + 'arb44.svg',
		nearTestnet: NEAR_LOGO,
	};
	const TOKEN_LOGOS = {
		ETH: IMG + 'ethereum-eth.svg',
		MATIC: IMG + 'Polygon_Icon.png',
		BTC: 'https://console.kwespay.xyz/logos/btc.svg',
		USDT: USDT_LOGO,
		USDC: USDC_LOGO,
		USDBC: USDC_LOGO,
		'USDC.E': USDC_LOGO,
		NEAR: NEAR_LOGO,
		MUSD: IMG + 'MUSD.png',
		MEZO: IMG + 'mezo.png',
		LSK: IMG + 'liskt.png',
		ARB: IMG + 'arb44.svg',
	};

	const USD_PRICE = { NEAR: 3.5, 'USDC.E': 1, DAI: 1, USDBC: 1, ETH: 3000, MATIC: 0.5, ARB: 0.5, LSK: 1, MEZO: 1, MUSD: 1, USDC: 1, USDT: 1 };
	const USD_PER_FIAT = { USD: 1, GHS: 1 / 15 };
	const FEE_BPS = 50n;
	const feeBps = (network) => (network === 'nearTestnet' ? 100n : FEE_BPS);
	const isNear = (network) => network === 'nearTestnet';

	const quotes = new Map();
	const transactions = new Map();
	let current = null;

	const post = (kind, label, detail) => {
		try {
			parent.postMessage({ source: 'kwespay-sandbox', kind, label, detail, at: Date.now() }, location.origin);
		} catch {}
	};

	const hex = (bytes) =>
		'0x' + Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, '0')).join('');
	const word = (n) => '0x' + BigInt(n).toString(16).padStart(64, '0');
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const isoIn = (minutes) => new Date(Date.now() + minutes * 60000).toISOString();

	function formatUnits(value, decimals) {
		const v = BigInt(value);
		const base = 10n ** BigInt(decimals);
		const whole = v / base;
		const frac = (v % base).toString().padStart(decimals, '0').slice(0, 6).replace(/0+$/, '');
		return frac ? `${whole}.${frac}` : `${whole}`;
	}

	function token(network, symbol) {
		const entry = TOKENS[network]?.[symbol.toUpperCase()] ?? TOKENS[network]?.[symbol];
		return entry ? { address: entry[0], decimals: entry[1] } : null;
	}

	const graphql = {
		paymentNetworks() {
			return {
				paymentNetworks: Object.keys(CONTRACTS).map((key) => ({
					key,
					name: NETWORKS[key].name,
					environment: 'testnet',
					ecosystem: isNear(key) ? 'near' : 'evm',
					chainId: NETWORKS[key].chainId,
					contractAddress: CONTRACTS[key],
					registryObjectId: null,
					platformFeeBps: Number(feeBps(key)),
					explorerTxUrl: isNear(key) ? 'https://testnet.nearblocks.io/txns/' : null,
					publicRpcUrl: isNear(key) ? NEAR_RPC : null,
					nativeSymbol: isNear(key) ? 'NEAR' : key === 'polygonAmoy' ? 'MATIC' : key === 'mezoTestnet' ? 'BTC' : 'ETH',
					networkPassphrase: null,
					logoUrl: NETWORK_LOGOS[key] ?? null,
					tokens: Object.entries(TOKENS[key]).map(([symbol, [address, decimals]]) => ({
						symbol,
						displaySymbol: symbol === 'USDC.E' ? 'USDC.e' : symbol,
						name: symbol,
						logoUrl: TOKEN_LOGOS[symbol] ?? null,
						address,
						decimals,
						isNative: address === ZERO || address === NEAR_NATIVE,
					})),
				})),
			};
		},
		getVendor({ vendorIdentifier }) {
			return {
				getVendor: {
					vendorPk: 1,
					vendorIdentifier,
					businessName: 'Example Store',
					acceptedCurrencies: ['ETH', 'MATIC', 'USDC', 'USDC.E', 'USDT', 'ARB', 'LSK', 'MUSD', 'BTC', 'MEZO', 'NEAR'],
					enabledNetworks: Object.keys(CONTRACTS),
					hasEvmWallet: true,
					hasSuiWallet: false,
					hasStellarWallet: false,
					hasNearWallet: true,
					crossChainNetworks: [],
					activeStatus: true,
				},
			};
		},
		submitTransactionHash({ input }) {
			const tx = transactions.get(input.transactionReference);
			if (!tx) throw new Error('Transaction not found');
			tx.hash = tx.hash || input.txHash;
			return {
				submitTransactionHash: {
					transactionReference: tx.reference,
					transactionStatus: 'processing',
					blockchainHash: tx.hash,
					blockchainNetwork: tx.quote.network,
				},
			};
		},
		validateAccessKey() {
			return {
				validateAccessKey: {
					isValid: true,
					keyId: 1,
					keyLabel: 'Docs simulation',
					activeFlag: true,
					expirationDate: null,
					vendorInfo: { vendorPk: 1, vendorIdentifier: 'YOUR_VENDOR_ID', businessName: 'Example Store' },
					allowedVendors: [1],
					allowedNetworks: null,
					allowedTokens: null,
					error: null,
				},
			};
		},
		createQuote({ input }) {
			const symbol = input.cryptoCurrency.toUpperCase();
			const t = token(input.network, symbol);
			const fx = USD_PER_FIAT[(input.fiatCurrency || 'USD').toUpperCase()];
			const price = USD_PRICE[symbol];
			if (!t || !fx || !price) {
				return { createQuote: { success: false, message: `${symbol} not supported on ${input.network}` } };
			}
			const human = (input.fiatAmount * fx) / price;
			const amount = BigInt(Math.round(human * 1e6)) * 10n ** BigInt(t.decimals - 6);
			const total = amount + (amount * feeBps(input.network)) / 10000n;
			const quoteId = 1000 + quotes.size + 1;
			const quote = {
				success: true,
				message: 'Quote ready. Use quote_id in createTransaction.',
				quoteId,
				quoteReference: crypto.randomUUID(),
				cryptoCurrency: symbol,
				tokenAddress: t.address,
				amountBaseUnits: amount.toString(),
				totalBaseUnits: total.toString(),
				displayAmount: Number(formatUnits(amount, t.decimals)),
				network: input.network,
				chainId: NETWORKS[input.network].chainId,
				expiresAt: isoIn(10),
			};
			quotes.set(quoteId, { ...quote, decimals: t.decimals });
			return { createQuote: quote };
		},
		createTransaction({ input }) {
			const q = quotes.get(Number(input.quoteId));
			if (!q) return { createTransaction: { success: false, message: 'Quote not found. Call createQuote to obtain a valid quote_id.' } };
			if (q.used) return { createTransaction: { success: false, message: 'This quote has already been used for a transaction.' } };
			q.used = true;
			const reference = crypto.randomUUID();
			const tx = {
				reference,
				quote: q,
				payer: input.payerWalletAddress,
				status: 'pending',
				hash: null,
				reads: 0,
			};
			transactions.set(reference, tx);
			current = tx;
			return {
				createTransaction: {
					success: true,
					message: 'Transaction ready. Sign in wallet.',
					paymentIdBytes32: hex(32),
					backendSignature: hex(isNear(q.network) ? 64 : 65),
					vendorIdentifier: 'YOUR_VENDOR_ID',
					vendorWallet: isNear(q.network) ? 'example-store.testnet' : null,
					tokenAddress: q.tokenAddress,
					amountBaseUnits: q.amountBaseUnits,
					totalBaseUnits: q.totalBaseUnits,
					chainId: q.chainId,
					deadline: Math.floor(Date.now() / 1000) + 900,
					expiresAt: isoIn(15),
					contractAddress: CONTRACTS[q.network] ?? null,
					registryObjectId: null,
					transaction: {
						transactionReference: reference,
						transactionStatus: 'pending',
						vendorInfo: { vendorIdentifier: 'YOUR_VENDOR_ID', suiWalletAddress: null },
					},
				},
			};
		},
		getTransactionStatus({ transactionReference }) {
			const tx = transactions.get(transactionReference);
			if (!tx) throw new Error('Transaction not found');
			if (tx.hash) {
				tx.reads += 1;
				tx.status = tx.reads === 1 ? 'processing' : scenario === 'underpaid' ? 'underpaid' : 'completed';
			}
			return {
				getTransactionStatus: {
					transactionReference: tx.reference,
					transactionStatus: tx.status,
					blockchainHash: tx.hash,
					blockchainNetwork: tx.quote.network,
					displayAmount: tx.quote.displayAmount,
					cryptoCurrency: tx.quote.cryptoCurrency,
					payerWalletAddress: tx.payer,
					initiatedAt: new Date().toISOString(),
				},
			};
		},
	};

	const realFetch = window.fetch.bind(window);
	window.fetch = async (resource, init = {}) => {
		const url = typeof resource === 'string' ? resource : resource.url;
		if (/walletconnect|reown|web3modal/i.test(url)) {
			throw new TypeError('WalletConnect is not available in this simulation. Use the KwesPay Test Wallet.');
		}
		if (url === NEAR_RPC) return nearRpc(JSON.parse(init.body || '{}'));
		if (!url.includes(API_HOST) || !url.endsWith('/graphql')) return realFetch(resource, init);
		const body = JSON.parse(init.body || '{}');
		const op = Object.keys(graphql).find((name) => new RegExp(`\\b${name}\\b\\s*[({]`).test(body.query));
		await sleep(250 + Math.random() * 350);
		let payload;
		try {
			payload = op ? { data: graphql[op](body.variables || {}) } : { data: null, errors: [{ message: 'Operation not simulated' }] };
		} catch (err) {
			payload = { data: null, errors: [{ message: err.message }] };
		}
		post('api', op || 'unknown', { variables: body.variables, response: payload });
		return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
	};

	function nearRpc({ id, params = {} }) {
		const funded = scenario !== 'insufficient';
		let result;
		if (params.request_type === 'view_account') {
			result = { amount: funded ? (10n ** 26n).toString() : '0', storage_usage: 0 };
		} else {
			const text = JSON.stringify(funded ? (10n ** 30n).toString() : '0');
			result = { result: Array.from(new TextEncoder().encode(text)) };
		}
		return new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
	}

	const RealWebSocket = window.WebSocket;
	window.WebSocket = function (url, protocols) {
		if (/walletconnect|reown/i.test(String(url))) throw new Error('WalletConnect is not available in this simulation.');
		return new RealWebSocket(url, protocols);
	};
	window.WebSocket.prototype = RealWebSocket.prototype;

	const listeners = {};
	const emit = (event, value) => (listeners[event] || []).forEach((fn) => fn(value));
	const wallet = { connected: false, chainId: 1, allowance: {}, sent: {} };

	function ask(title, details) {
		return new Promise((resolve, reject) => {
			const sheet = document.querySelector('[data-wallet]');
			sheet.querySelector('[data-wallet-title]').textContent = title;
			const dl = sheet.querySelector('[data-wallet-details]');
			dl.innerHTML = '';
			for (const [k, v] of details) {
				const row = document.createElement('div');
				const dt = document.createElement('dt');
				const dd = document.createElement('dd');
				dt.textContent = k;
				dd.textContent = v;
				row.append(dt, dd);
				dl.append(row);
			}
			document.body.append(sheet);
			sheet.hidden = false;
			const confirm = sheet.querySelector('[data-wallet-confirm]');
			const rejectBtn = sheet.querySelector('[data-wallet-reject]');
			confirm.focus();
			const done = (ok) => {
				sheet.hidden = true;
				confirm.onclick = rejectBtn.onclick = null;
				post('wallet', ok ? 'Confirmed in wallet' : 'Rejected in wallet', { request: title });
				if (ok) resolve();
				else reject(Object.assign(new Error('User rejected the request.'), { code: 4001 }));
			};
			confirm.onclick = () => done(true);
			rejectBtn.onclick = () => done(false);
		});
	}

	const nearWallet = {
		async getAccounts() {
			if (!wallet.nearConnected) {
				await ask('Connect to this site?', [
					['Site', location.host],
					['Account', NEAR_ACCOUNT],
				]);
				wallet.nearConnected = true;
			}
			return [{ accountId: NEAR_ACCOUNT }];
		},
		async signAndSendTransaction({ receiverId, actions }) {
			const q = current?.quote;
			await ask('Confirm payment', [
				['Pay', q ? `${formatUnits(q.totalBaseUnits, q.decimals)} ${q.cryptoCurrency}` : 'Unknown'],
				['To', `KwesPay contract ${CONTRACTS.nearTestnet}`],
				['Method', actions[0]?.params?.methodName ?? 'Unknown'],
				['Network', NETWORKS.nearTestnet.name],
			]);
			const hash = hex(32).slice(2);
			if (current) current.hash = hash;
			post('wallet', 'signAndSendTransaction', { receiverId, actions });
			return {
				status: { SuccessValue: btoa(JSON.stringify(q?.totalBaseUnits ?? '0')) },
				transaction: { hash },
				transaction_outcome: { id: hash },
				receipts_outcome: [],
			};
		},
	};

	const networkName = (chainId) => Object.values(NETWORKS).find((n) => n.chainId === chainId)?.name ?? `Chain ${chainId}`;
	const short = (a) => `${a.slice(0, 8)}…${a.slice(-6)}`;

	async function request({ method, params = [] }) {
		switch (method) {
			case 'eth_accounts':
				return wallet.connected ? [ACCOUNT] : [];
			case 'eth_requestAccounts':
				if (!wallet.connected) {
					await ask('Connect to this site?', [
						['Site', location.host],
						['Account', short(ACCOUNT)],
					]);
					wallet.connected = true;
					emit('accountsChanged', [ACCOUNT]);
				}
				return [ACCOUNT];
			case 'eth_chainId':
				return '0x' + wallet.chainId.toString(16);
			case 'net_version':
				return String(wallet.chainId);
			case 'wallet_switchEthereumChain': {
				const target = parseInt(params[0].chainId, 16);
				if (target !== wallet.chainId) {
					await ask('Switch network?', [
						['From', networkName(wallet.chainId)],
						['To', networkName(target)],
					]);
					wallet.chainId = target;
					emit('chainChanged', '0x' + target.toString(16));
				}
				return null;
			}
			case 'wallet_addEthereumChain':
				return null;
			case 'eth_getBalance':
				return scenario === 'insufficient' && current?.quote.tokenAddress === ZERO ? word(10n ** 14n) : word(10n ** 19n);
			case 'eth_blockNumber':
				return word(9000000);
			case 'eth_gasPrice':
			case 'eth_maxPriorityFeePerGas':
				return word(1000000000n);
			case 'eth_feeHistory':
				return { oldestBlock: '0x895440', baseFeePerGas: ['0x3b9aca00', '0x3b9aca00'], gasUsedRatio: [0.5], reward: [['0x3b9aca00']] };
			case 'eth_estimateGas':
				return word(150000);
			case 'eth_getBlockByNumber':
				return { number: '0x895440', baseFeePerGas: '0x3b9aca00' };
			case 'eth_call': {
				const { to, data = '0x' } = params[0];
				if (data.startsWith('0x70a08231')) return word(scenario === 'insufficient' ? 0n : 10n ** 30n);
				if (data.startsWith('0xdd62ed3e')) return word(wallet.allowance[to.toLowerCase()] ?? 0n);
				return '0x';
			}
			case 'eth_sendTransaction': {
				const tx = params[0];
				const data = tx.data || '0x';
				const q = current?.quote;
				const amountLabel = q ? `${formatUnits(q.totalBaseUnits, q.decimals)} ${q.cryptoCurrency}` : 'Unknown';
				if (data.startsWith('0x095ea7b3')) {
					const allowance = BigInt('0x' + data.slice(74, 138));
					await ask(`Allow spending of ${q?.cryptoCurrency ?? 'token'}?`, [
						['Spender', short('0x' + data.slice(34, 74))],
						['Allowance', q ? `${formatUnits(allowance, q.decimals)} ${q.cryptoCurrency}` : allowance.toString()],
						['Network', networkName(wallet.chainId)],
					]);
					wallet.allowance[tx.to.toLowerCase()] = allowance;
				} else {
					await ask('Confirm payment', [
						['Pay', amountLabel],
						['To', `KwesPay contract ${short(tx.to)}`],
						['Network', networkName(wallet.chainId)],
					]);
				}
				const hash = hex(32);
				wallet.sent[hash] = Date.now();
				if (!data.startsWith('0x095ea7b3') && current) current.hash = hash;
				return hash;
			}
			case 'eth_getTransactionReceipt': {
				const sentAt = wallet.sent[params[0]];
				if (!sentAt || Date.now() - sentAt < 1500) return null;
				return { transactionHash: params[0], status: '0x1', blockNumber: '0x895441' };
			}
			default:
				throw Object.assign(new Error(`${method} is not supported by the test wallet`), { code: 4200 });
		}
	}

	const provider = {
		isKwesPayTestWallet: true,
		async request(args) {
			const result = await request(args);
			if (!['eth_chainId', 'eth_accounts', 'eth_getTransactionReceipt', 'eth_getBlockByNumber'].includes(args.method)) {
				post('wallet', args.method, { params: args.params, result });
			}
			return result;
		},
		on(event, fn) {
			(listeners[event] ||= []).push(fn);
			return provider;
		},
		removeListener(event, fn) {
			listeners[event] = (listeners[event] || []).filter((f) => f !== fn);
			return provider;
		},
	};

	const icon =
		'data:image/svg+xml,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#141413"/><path d="M9 8h3v16H9zM13 16l7-8h4l-7 8 7 8h-4z" fill="#faf9f6"/></svg>',
		);
	const announce = () =>
		window.dispatchEvent(
			new CustomEvent('eip6963:announceProvider', {
				detail: Object.freeze({
					info: { uuid: TEST_WALLET_UUID, name: 'KwesPay Test Wallet', icon, rdns: 'xyz.kwespay.testwallet' },
					provider,
				}),
			}),
		);
	const TEST_WALLET_UUID = 'kwespay-test-wallet';
	const nativeAddEventListener = window.addEventListener.bind(window);
	const wrapped = new WeakMap();
	window.addEventListener = function (type, listener, options) {
		if (type === 'eip6963:announceProvider' && typeof listener === 'function') {
			const only = (event) => {
				if (event?.detail?.info?.uuid === TEST_WALLET_UUID) listener.call(this, event);
			};
			wrapped.set(listener, only);
			return nativeAddEventListener(type, only, options);
		}
		return nativeAddEventListener(type, listener, options);
	};
	const nativeRemoveEventListener = window.removeEventListener.bind(window);
	window.removeEventListener = function (type, listener, options) {
		return nativeRemoveEventListener(type, wrapped.get(listener) ?? listener, options);
	};
	try {
		Object.defineProperty(window, 'ethereum', { configurable: true, get: () => provider });
	} catch {}
	nativeAddEventListener('eip6963:requestProvider', announce);

	const EVENTS = [
		'widgetOpened', 'widgetClosed', 'widgetDestroyed', 'apiKeyValidated', 'apiKeyInvalid', 'apiKeyError',
		'walletConnected', 'walletConnectionError', 'paymentSuccess', 'paymentFinalised', 'paymentConfirmed', 'paymentIncomplete', 'paymentUnconfirmed',
		'paymentError', 'paymentCancelled', 'amountUpdated',
	];
	for (const name of EVENTS) {
		window.addEventListener(`kwespay:${name}`, (e) => post('event', `kwespay:${name}`, e.detail ?? {}));
	}

	window.__kwespaySandbox = { post, scenario, nearWallet };
})();
