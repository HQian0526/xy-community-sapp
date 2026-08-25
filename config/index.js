/** 若用户未绑定商户，则默认获取以下商户信息 */
export const bindStoreId = 10002

const IDENTITY_USER = 1

/**
 * 普通用户浏览商城/其他业务用的店铺 id：有 bindStoreId 用绑定值，否则用默认配置
 * @param {Object} [user]
 * @returns {string|number|''}
 */
export function resolveMallStoreId(user) {
	const identityType = user == null || user.identityType == null
		? IDENTITY_USER
		: Number(user.identityType)
	if (identityType !== IDENTITY_USER) {
		return ''
	}
	const bound = user?.bindStoreId
	if (bound !== undefined && bound !== null && String(bound).trim() !== '') {
		return bound
	}
	return bindStoreId
}
