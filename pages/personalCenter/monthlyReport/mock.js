import dayjs from 'dayjs'

const monthlyIncomeList = [3280, 4120, 3890, 5120, 4780, 5360]

export function getMonthlyReportData() {
	const categories = []
	const data = []

	for (let i = 5; i >= 0; i -= 1) {
		const month = dayjs().subtract(i, 'month')
		categories.push(`${month.month() + 1}月`)
		data.push(monthlyIncomeList[5 - i])
	}

	const totalIncome = data.reduce((sum, item) => sum + item, 0)

	return {
		categories,
		series: [{
			name: '月收入',
			data,
			color: '#ff6034'
		}],
		totalIncome,
		avgIncome: totalIncome / data.length
	}
}

export function formatMoney(value) {
	return Number(value || 0).toFixed(2)
}
