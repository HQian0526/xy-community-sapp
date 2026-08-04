import {
	get
} from '../request.js'

/**
 * 查询商户列表/详情
 * @param {Object} [params] 可选：userId、storeId、storeName、pageNum、pageSize 等
 */
export function getStoreListApi(params) {
	return get('/store/findStore', params)
}
