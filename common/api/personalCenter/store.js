import {
	get,
	put,
	uploadFile
} from '../request.js'

/** 商户状态：1 营业中，2 打烊 */
export const STORE_STATUS_OPEN = 1
export const STORE_STATUS_CLOSED = 2

const WEEKDAY_LABELS = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

export function getStoreStatusLabel(storeStatus) {
	return Number(storeStatus) === STORE_STATUS_CLOSED ? '打烊' : '营业中'
}

export function isStoreClosed(storeStatus) {
	return Number(storeStatus) === STORE_STATUS_CLOSED
}

/** 营业中 / 休息中 / 打烊 */
export function getStoreOpenLabel(store) {
	if (!store) return '营业中'
	if (isStoreClosed(store.storeStatus)) return '打烊'
	if (store.acceptingOrders === false) return '休息中'
	return '营业中'
}

export function isStorePaused(store) {
	if (!store) return false
	if (isStoreClosed(store.storeStatus)) return true
	return store.acceptingOrders === false
}

export function parseBusinessHours(raw) {
	if (!raw) {
		return {
			rules: []
		}
	}
	if (typeof raw === 'object') {
		return {
			rules: Array.isArray(raw.rules) ? raw.rules : []
		}
	}
	try {
		const parsed = JSON.parse(raw)
		return {
			rules: Array.isArray(parsed?.rules) ? parsed.rules : []
		}
	} catch (e) {
		return {
			rules: []
		}
	}
}

export function formatBusinessHoursText(raw) {
	const hours = parseBusinessHours(raw)
	const rules = hours.rules || []
	if (!rules.length) return ''
	return rules.map((rule) => {
		const days = formatDays(rule.days || [])
		return `${days} ${rule.start || ''}-${rule.end || ''}`.trim()
	}).filter(Boolean).join('；')
}

function formatDays(days) {
	const unique = [...new Set((days || []).map(Number).filter((d) => d >= 1 && d <= 7))].sort((a, b) => a - b)
	if (unique.length === 7) return '每天'
	if (!unique.length) return ''
	const consecutive = unique.every((d, i) => i === 0 || d === unique[i - 1] + 1)
	if (consecutive) {
		if (unique.length === 1) return WEEKDAY_LABELS[unique[0]]
		return `${WEEKDAY_LABELS[unique[0]]}至${WEEKDAY_LABELS[unique[unique.length - 1]]}`
	}
	return unique.map((d) => WEEKDAY_LABELS[d]).join('、')
}

/**
 * 查询商户列表/详情
 * @param {Object} [params] 可选：userId、storeId、storeName、pageNum、pageSize 等
 */
export function getStoreListApi(params) {
	return get('/store/findStore', params)
}

/**
 * 修改商户信息（含营业状态 storeStatus）
 * @param {Object} data 至少包含 id；改状态时传 storeStatus
 */
export function updateStoreApi(data) {
	return put('/store/updateStore', data)
}

/**
 * 商家资料：只改当前登录商家的店铺照片、名称、位置
 * @param {{ storeName: string, avatar?: string, address?: string }} data
 */
export function updateStoreProfileApi(data) {
	return put('/store/updateStoreProfile', data)
}

/** 上传店铺照片，返回存储路径 */
export function uploadStoreImageApi(filePath) {
	return uploadFile(filePath)
}

/**
 * 设置当前商家营业时间。rules 空数组 = 全天可下单
 * @param {{ rules: Array<{ days: number[], start: string, end: string }> }} data
 */
export function updateBusinessHoursApi(data) {
	return put('/store/updateBusinessHours', data)
}

/**
 * 下单前实时校验店铺是否营业（走 /store/findStore，不读本地缓存）
 * @param {string|number} [storeId]
 * @returns {Promise<{ ok: boolean, reason?: string, store?: object }>}
 */
export async function assertStoreOpenForOrder(storeId) {
	try {
		const data = await getStoreListApi(storeId ? {
			storeId
		} : {})
		const list = Array.isArray(data) ? data : (data?.list || [])
		if (!list.length) {
			return {
				ok: true
			}
		}
		const store = storeId
			? (list.find((item) => String(item.storeId) === String(storeId)) || list[0])
			: list[0]
		if (isStoreClosed(store?.storeStatus)) {
			uni.showToast({
				title: '店铺已打烊，请于营业时间下单',
				icon: 'none'
			})
			return {
				ok: false,
				reason: 'closed',
				store
			}
		}
		if (store?.acceptingOrders === false) {
			const hoursText = store.businessHoursText || formatBusinessHoursText(store.businessHours)
			uni.showToast({
				title: hoursText ? `当前不在营业时间内（${hoursText}）` : '当前不在营业时间内',
				icon: 'none'
			})
			return {
				ok: false,
				reason: 'hours',
				store
			}
		}
		return {
			ok: true,
			store
		}
	} catch (error) {
		console.error('校验店铺营业状态失败', error)
		uni.showToast({
			title: '暂时无法确认店铺状态，请稍后重试',
			icon: 'none'
		})
		return {
			ok: false,
			reason: 'error'
		}
	}
}
