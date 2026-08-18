import {
	post
} from '../request.js'

/**
 * 添加来客信息
 * @param {Object} data visitorName、phone、remark 等
 */
export function addVisitorApi(data) {
	return post('/visitor/addVisitor', data)
}
