import { categoryList } from './mock.js'

export const CART_STORAGE_KEY = 'mallCartMap'

export function getCartMap() {
	const cached = uni.getStorageSync(CART_STORAGE_KEY)
	return cached && typeof cached === 'object' ? cached : {}
}

export function setCartMap(cartMap) {
	uni.setStorageSync(CART_STORAGE_KEY, cartMap || {})
}

export function clearCartMap() {
	setCartMap({})
}

export function getCartItems(cartMap = getCartMap()) {
	const items = []
	categoryList.forEach(cate => {
		cate.children.forEach(product => {
			const count = cartMap[product.id] || 0
			if (count > 0) {
				items.push({ ...product, count })
			}
		})
	})
	return items
}

export function getCartCount(cartMap = getCartMap()) {
	return Object.values(cartMap).reduce((sum, n) => sum + Number(n || 0), 0)
}

export function getCartTotal(cartMap = getCartMap()) {
	let total = 0
	categoryList.forEach(cate => {
		cate.children.forEach(product => {
			const count = cartMap[product.id] || 0
			total += count * product.price
		})
	})
	return total
}
