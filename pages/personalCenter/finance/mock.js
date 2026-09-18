export function formatAmountDisplay(type, amount) {
	const prefix = type === 'income' ? '+' : '-'
	return `${prefix}${Number(amount).toFixed(2)}`
}
