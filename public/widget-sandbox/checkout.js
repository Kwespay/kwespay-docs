(() => {
	const params = new URLSearchParams(location.search);
	const amount = Number(params.get('amount')) > 0 ? Number(params.get('amount')) : 120;
	const currency = params.get('currency') === 'USD' ? 'USD' : 'GHS';
	const tokens = params.get('tokens') === 'stablecoins' ? 'stablecoins' : undefined;
	const { post, nearWallet } = window.__kwespaySandbox;

	const symbol = currency === 'GHS' ? 'GH₵' : '$';
	document.querySelector('[data-order-total]').textContent = `${symbol}${amount.toFixed(2)} ${currency}`;

	const button = document.querySelector('[data-open-checkout]');
	const result = document.querySelector('[data-result]');

	button.addEventListener('click', async () => {
		button.disabled = true;
		result.hidden = true;
		const config = { apiKey: 'YOUR_TESTNET_API_KEY', environment: 'testnet', amount, currency, orderId: '1042' };
		if (tokens) config.acceptedTokens = tokens;
		post('code', 'kwespay(config)', config);
		try {
			const payment = await window.KwesPay.kwespay({ ...config, nearWallet });
			post('result', 'Promise resolved', payment);
			result.textContent = `Widget resolved with transactionStatus "${payment.transactionStatus}". Your server would now call verifyPayment("${payment.transactionReference}", { orderId: "1042", amount: ${amount}, currency: "${currency}" }).`;
		} catch (err) {
			post('result', 'Promise rejected', { code: err.code, message: err.message });
			result.textContent = `Widget rejected with code ${err.code ?? 'UNKNOWN'}.`;
		} finally {
			result.hidden = false;
			button.disabled = false;
		}
	});

	document.addEventListener(
		'click',
		(e) => {
			const link = e.target instanceof Element ? e.target.closest('#kwespay-explorerLink') : null;
			if (!link) return;
			e.preventDefault();
			e.stopPropagation();
			post('wallet', 'Block explorer link', { href: link.href, note: 'Not opened: the hash in this simulation does not exist on any chain.' });
		},
		true,
	);

	post('ready', 'Sandbox ready', { amount, currency, acceptedTokens: tokens ?? 'all' });
})();
