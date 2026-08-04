export const CART_STORAGE_KEY = 'mallCartMap'
export const CART_PRODUCTS_KEY = 'mallCartProducts'

export function getCartMap() {
	const cached = uni.getStorageSync(CART_STORAGE_KEY)
	return cached && typeof cached === 'object' ? cached : {}
}

export function setCartMap(cartMap) {
	uni.setStorageSync(CART_STORAGE_KEY, cartMap || {})
}

export function clearCartMap() {
	setCartMap({})
	uni.removeStorageSync(CART_PRODUCTS_KEY)
}

export function getCartProducts() {
	const cached = uni.getStorageSync(CART_PRODUCTS_KEY)
	return cached && typeof cached === 'object' ? cached : {}
}

export function rememberCartProduct(product) {
	if (!product || product.id === undefined || product.id === null) return
	const map = getCartProducts()
	map[product.id] = {
		id: product.id,
		name: product.name,
		price: Number(product.price || 0),
		icon: product.icon || '',
		unit: product.unit || '',
		has: product.has,
		catagoryId: product.catagoryId
	}
	uni.setStorageSync(CART_PRODUCTS_KEY, map)
}

export function getCartItems(cartMap = getCartMap()) {
	const products = getCartProducts()
	const items = []
	Object.keys(cartMap || {}).forEach((id) => {
		const count = Number(cartMap[id] || 0)
		const product = products[id]
		if (count > 0 && product) {
			items.push({
				...product,
				count
			})
		}
	})
	return items
}

export function getCartCount(cartMap = getCartMap()) {
	return Object.values(cartMap || {}).reduce((sum, n) => sum + Number(n || 0), 0)
}

export function getCartTotal(cartMap = getCartMap()) {
	const products = getCartProducts()
	let total = 0
	Object.keys(cartMap || {}).forEach((id) => {
		const count = Number(cartMap[id] || 0)
		const product = products[id]
		if (count > 0 && product) {
			total += count * Number(product.price || 0)
		}
	})
	return total
}
