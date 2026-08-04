import {
	get
} from '../request.js'

/**
 * 查询商品分类列表
 * @param {Object} [params] 可选：catagoryName、storeId、pageNum、pageSize 等
 */
export function getCatagoryListApi(params) {
	return get('/catagory/findCatagory', params)
}
