export function parseBusinessUnitPrice(fee) {
	const match = String(fee || '').match(/(\d+(?:\.\d+)?)/)
	return match ? parseFloat(match[1]) : 0
}

export function formatMoney(value) {
	return Number(value || 0).toFixed(2)
}
