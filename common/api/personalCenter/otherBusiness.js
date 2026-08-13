import {
	get,
	post,
	put,
	del
} from '../request.js'

/**
 * 后端字段 -> 页面展示字段
 */
export function mapOtherBusinessItem(item = {}) {
	return {
		id: item.id != null ? String(item.id) : '',
		storeId: item.storeId != null ? String(item.storeId) : '',
		storeName: item.storeName || '',
		name: item.businessName || '',
		description: item.businessDesc || '',
		fee: item.businessFee || '',
		businessName: item.businessName || '',
		businessDesc: item.businessDesc || '',
		businessFee: item.businessFee || ''
	}
}

/**
 * 页面表单字段 -> 后端提交字段
 */
export function toOtherBusinessPayload(form = {}) {
	const payload = {
		businessName: String(form.name || form.businessName || '').trim(),
		businessDesc: String(form.description || form.businessDesc || '').trim(),
		businessFee: String(form.fee || form.businessFee || '').trim()
	}
	if (form.id) {
		payload.id = form.id
	}
	return payload
}

/**
 * 查询其他业务列表
 * @param {Object} [params] 可选：id、storeId、businessName、pageNum、pageSize 等
 */
export function getOtherBusinessListApi(params) {
	return get('/otherBusiness/findOtherBusiness', params)
}

/**
 * 新增其他业务
 * @param {Object} data
 */
export function addOtherBusinessApi(data) {
	return post('/otherBusiness/addOtherBusiness', data)
}

/**
 * 修改其他业务
 * @param {Object} data 至少包含 id
 */
export function updateOtherBusinessApi(data) {
	return put('/otherBusiness/updateOtherBusiness', data)
}

/**
 * 删除其他业务（逻辑删除）
 * @param {Array<string|number>} idList
 */
export function deleteOtherBusinessApi(idList) {
	return del('/otherBusiness/deleteOtherBusiness', idList)
}
