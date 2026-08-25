/**
 * 接口基础地址配置
 * 改 IP / 端口 / 网关前缀只改这里
 *
 * 开发者工具模拟器：可用 http://localhost:8080/api
 * 真机调试：必须用电脑局域网 IP（手机访问不到 localhost）
 * 当前本机局域网：http://192.168.102.181:8080/api
 * 线上网关：https://api.gzstarfly.com/api
 *
 * 业务接口路径不要再带 /api 前缀，例如：/wx/login、/product/findProduct
 */
export const API_BASE_URL = 'https://api.gzstarfly.com/api'

/** 文件/图片 CDN 前缀（接口常返回相对路径） */
export const FILE_BASE_URL = 'https://file.gzstarfly.com'

/**
 * 拼接文件完整地址；已是 http(s) 则原样返回
 * @param {string} path
 * @returns {string}
 */
export function resolveFileUrl(path) {
	if (!path) return ''
	const value = String(path).trim()
	if (!value) return ''
	if (/^https?:\/\//i.test(value)) return value
	const base = FILE_BASE_URL.replace(/\/$/, '')
	const relative = value.startsWith('/') ? value : `/${value}`
	return `${base}${relative}`
}
