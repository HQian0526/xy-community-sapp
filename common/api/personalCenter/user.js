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
 * 修改当前用户信息
 * @param {Object} data 至少包含 id
 */
export function updateUserApi(data) {
	return put('/user/updateUser', data)
}
