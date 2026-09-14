import {
	get,
	post
} from '../request.js'
import {
	requestWxPayment
} from './order.js'

export const MIN_RECHARGE_AMOUNT = 100
export const RECHARGE_PRESETS = [100, 200, 500]

export function getStoreMemberMineApi(storeId) {
	return get('/storeMember/mine', storeId ? { storeId } : {}, {
		showError: false
	})
}

export function rechargeStoreMemberApi(data) {
	return post('/storeMember/recharge', data, {
		loading: true,
		loadingText: '正在下单...'
	})
}

export function queryStoreMemberRechargeApi(rechargeNo) {
	return get('/storeMember/recharge/query', {
		rechargeNo
	})
}

export function mockConfirmStoreMemberRechargeApi(rechargeNo) {
	return post('/storeMember/recharge/mockConfirm', {
		rechargeNo
	}, {
		loading: true,
		loadingText: '确认支付中...'
	})
}

export async function waitStoreMemberRechargePaid(rechargeNo, {
	times = 5,
	intervalMs = 800
} = {}) {
	let last = null
	for (let i = 0; i < times; i++) {
		last = await queryStoreMemberRechargeApi(rechargeNo)
		const status = Number(last?.recharge?.payStatus)
		if (status === 1 || status === 2) {
			return last
		}
		if (i < times - 1) {
			await new Promise((r) => setTimeout(r, intervalMs))
		}
	}
	return last
}

export async function requestStoreMemberRechargePay(payParams) {
	return requestWxPayment(payParams)
}

export function pickDisplayPrice(item) {
	const regular = Number(item?.price || 0)
	const member = Number(item?.memberPrice)
	const hasMemberPrice = Number.isFinite(member) && member > 0 && member < regular
	return {
		price: hasMemberPrice ? member : regular,
		originalPrice: regular,
		memberPrice: hasMemberPrice ? member : null,
		hasMemberPrice
	}
}

export function formatMemberBalance(value) {
	const n = Number(value)
	if (!Number.isFinite(n)) return '0.00'
	return n.toFixed(2)
}
