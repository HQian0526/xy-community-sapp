import {
	get,
	put
} from '../request.js'

/**
 * 获取当前登录用户信息
 */
export function getUserInfoApi() {
	return get('/user/getUserInfo')
}

/**
 * 店铺顾客列表（本店已进店且未拉黑的普通用户）
 * @param {Object} [params]
 */
export function getCustomerListApi(params) {
	return get('/user/findCustomer', params)
}

function formatDateTime(value) {
	if (!value) return ''
	return String(value).replace('T', ' ').slice(0, 19)
}

/**
 * 后端用户字段 -> 顾客列表展示字段
 */
export function mapCustomerItem(item = {}) {
	const phone = item.phone || ''
	const realName = item.realName || ''
	const createdTime = formatDateTime(item.createdTime)
	return {
		id: item.id != null ? String(item.id) : '',
		userId: item.id != null ? String(item.id) : '',
		bindStoreId: item.bindStoreId != null ? String(item.bindStoreId) : '',
		phone,
		realName,
		avatar: item.avatar || '',
		createdTime,
		nickname: realName || phone || '微信用户',
		label: phone || '未授权手机号'
	}
}

/**
 * 修改当前用户信息
 * @param {Object} data 至少包含 id
 */
export function updateUserApi(data) {
	return put('/user/updateUser', data)
}

/**
 * 小程序资料设置：只改当前登录用户的昵称、性别、默认收货地址
 * @param {{ realName: string, sex?: number|null, address?: string }} data
 */
export function updateProfileApi(data) {
	return put('/user/updateProfile', data)
}
