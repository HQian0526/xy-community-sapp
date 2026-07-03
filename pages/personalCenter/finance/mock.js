export const FINANCE_STORAGE_KEY = 'financeRecords'

export const financeTypeMap = {
	income: '收入',
	expense: '支出'
}

export const financeRecordList = [
	{
		id: '1',
		type: 'income',
		title: '任务酬金',
		desc: '帮拿快递 - 取件任务',
		amount: 2,
		time: '2025-09-02 18:30:15',
		status: '已到账'
	},
	{
		id: '2',
		type: 'income',
		title: '分享赚佣',
		desc: '邀请好友注册奖励',
		amount: 5,
		time: '2025-09-01 14:20:08',
		status: '已到账'
	},
	{
		id: '3',
		type: 'expense',
		title: '发布任务',
		desc: '逛商场的帮忙带瓶花生油',
		amount: 5,
		time: '2025-09-01 10:12:27',
		status: '已支付'
	},
	{
		id: '4',
		type: 'expense',
		title: '提现',
		desc: '提现至微信零钱',
		amount: 100,
		time: '2025-08-28 09:45:33',
		status: '处理中'
	},
	{
		id: '5',
		type: 'income',
		title: '任务酬金',
		desc: '有会修洗衣机的吗 - 维修任务',
		amount: 100,
		time: '2025-08-27 16:08:42',
		status: '已到账'
	},
	{
		id: '6',
		type: 'expense',
		title: '发布任务',
		desc: '上门安装openclaw小龙虾',
		amount: 398,
		time: '2025-08-26 11:30:00',
		status: '已支付'
	}
]

export function getFinanceRecords() {
	const cached = uni.getStorageSync(FINANCE_STORAGE_KEY)
	return cached && cached.length ? cached : [...financeRecordList]
}

export function formatMoney(value) {
	const num = Number(value || 0)
	const prefix = num >= 0 ? '' : '-'
	return `${prefix}¥${Math.abs(num).toFixed(2)}`
}

export function formatAmountDisplay(type, amount) {
	const prefix = type === 'income' ? '+' : '-'
	return `${prefix}${Number(amount).toFixed(2)}`
}

export function getFinanceSummary(records) {
	return records.reduce(
		(acc, item) => {
			const val = Number(item.amount) || 0
			if (item.type === 'income') {
				acc.income += val
			} else {
				acc.expense += val
			}
			return acc
		},
		{ income: 0, expense: 0 }
	)
}

export function filterFinanceRecords(records, filterType) {
	if (!filterType || filterType === 'all') {
		return records
	}
	return records.filter(item => item.type === filterType)
}
