import {
	get,
	put
} from '../request.js'

/** 商户状态：1 营业中，2 打烊 */
export const STORE_STATUS_OPEN = 1
export const STORE_STATUS_CLOSED = 2

export function getStoreStatusLabel(storeStatus) {
	return Number(storeStatus) === STORE_STATUS_CLOSED ? '打烊' : '营业中'
}

export function isStoreClosed(storeStatus) {
	return Number(storeStatus) === STORE_STATUS_CLOSED
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
