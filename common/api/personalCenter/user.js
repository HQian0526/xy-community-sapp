import {
	get
} from '../request.js'

/**
 * 获取当前登录用户信息
 */
export function getUserInfoApi() {
	return get('/user/getUserInfo')
}
