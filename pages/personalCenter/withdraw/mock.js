import { storeInfo } from '../mock.js'

export const MIN_WITHDRAW = 10
export const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/
export const BALANCE_STORAGE_KEY = 'walletBalance'

export const withdrawInfo = {
	withdrawMethod: '微信零钱',
	arrivalTip: '预计 1-3 个工作日到账',
	minAmount: MIN_WITHDRAW
}

export function getWalletBalance() {
	const cached = uni.getStorageSync(BALANCE_STORAGE_KEY)
	if (cached !== '' && cached !== null && cached !== undefined) {
		return Number(cached)
	}
	return storeInfo.totalAssets
}

export function setWalletBalance(balance) {
	uni.setStorageSync(BALANCE_STORAGE_KEY, Number(balance).toFixed(2))
}

export function formatMoney(value) {
	return Number(value || 0).toFixed(2)
}

export function validateWithdrawAmount(amount, balance) {
	const str = String(amount ?? '').trim()
	if (!str) {
		return { valid: false, message: '请输入提现金额' }
	}
	if (!AMOUNT_PATTERN.test(str)) {
		return { valid: false, message: '金额格式不正确，最多保留两位小数' }
	}
	const num = parseFloat(str)
	if (num <= 0) {
		return { valid: false, message: '提现金额需大于 0' }
	}
	if (num < MIN_WITHDRAW) {
		return { valid: false, message: `最低提现 ${MIN_WITHDRAW} 元` }
	}
	if (balance < MIN_WITHDRAW) {
		return { valid: false, message: `可提现余额不足 ${MIN_WITHDRAW} 元，暂无法提现` }
	}
	if (num > balance) {
		return { valid: false, message: '提现金额不能超过可提现余额' }
	}
	return { valid: true, message: '' }
}
