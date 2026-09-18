export function formatMoney(value) {
	return Number(value || 0).toFixed(2)
}

export function getGoodsSummary(goods = []) {
	const count = goods.reduce((sum, item) => sum + item.count, 0)
	const firstName = goods[0]?.name || ''
	if (goods.length <= 1) {
		return firstName
	}
	return `${firstName} 等${count}件商品`
}
