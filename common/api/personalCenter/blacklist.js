import {
	get,
	post
} from '../request.js'

function formatDateTime(value) {
	if (!value) return ''
	return String(value).replace('T', ' ').slice(0, 19)
}

/**
 * 后端字段 -> 页面展示字段
 */
export function mapBlacklistItem(item = {}) {
	const phone = item.phone || ''
	const realName = item.realName || ''
	const createdTime = formatDateTime(item.createdTime)
	const reason = item.reason || item.remark || ''
	const labelParts = [phone || '未授权手机号']
	if (reason) labelParts.push(reason)
	return {
		id: item.id != null ? String(item.id) : '',
		storeId: item.storeId != null ? String(item.storeId) : '',
		userId: item.userId != null ? String(item.userId) : '',
		phone,
		realName,
		reason: item.reason || '',
		remark: item.remark || '',
		createdTime,
		nickname: realName || phone || '未知用户',
		label: labelParts.join(' · ')
	}
}

/**
 * 查询本店黑名单（商户无需传 storeId，后端按当前账号店铺过滤）
 * @param {Object} [params]
 */
export function getStoreBlacklistApi(params) {
	return get('/storeBlacklist/findStoreBlacklist', params)
}

/**
 * 解除拉黑（逻辑删除）
 * 微信 DELETE 常把数组转成对象，这里走 POST，body 仍是 id 数组
 * @param {Array<string|number>} idList
 */
export function deleteStoreBlacklistApi(idList) {
	return post('/storeBlacklist/deleteStoreBlacklist', idList)
}

/**
 * 拉黑顾客（商户无需传 storeId）
 * @param {Object} data 可含 userId、phone、realName、reason
 */
export function addStoreBlacklistApi(data) {
	return post('/storeBlacklist/addStoreBlacklist', data)
}
