import {
	get
} from '../request.js'

/**
 * 查询商品列表
 * @param {Object} [params] 可选：catagoryId、productName、productStatus、pageNum、pageSize 等
 */
export function getProductListApi(params) {
	return get('/product/findProduct', params)
}
