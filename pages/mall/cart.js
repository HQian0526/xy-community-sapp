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
		productId: product.productId || product.id,
		name: product.name,
		price: Number(product.price || 0),
		icon: product.icon || '',
		unit: product.unit || '',
		has: product.has,
		catagoryId: product.catagoryId,
		storeId: product.storeId || '',
		offShelf: !!product.offShelf
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

/**
 * 加购指定数量。跨店或缺货时不写入。
 * @returns {{ ok: boolean, reason?: string, count?: number, stock?: number }}
 */
export function addCartQuantity(product, quantity = 1) {
	if (!product || product.id === undefined || product.id === null) {
		return { ok: false, reason: 'invalid' }
	}
	const qty = Math.max(1, Number(quantity) || 1)
	const storeId = String(product.storeId || '')
	if (storeId) {
		const foreign = getCartItems().find(
			(item) => item.storeId && String(item.storeId) !== storeId
		)
		if (foreign) {
			return { ok: false, reason: 'otherStore' }
		}
	}
	const map = getCartMap()
	const current = Number(map[product.id] || 0)
	const next = current + qty
	const stock = Number(product.has)
	if (Number.isFinite(stock) && stock >= 0 && next > stock) {
		return { ok: false, reason: 'stock', stock, count: current }
	}
	rememberCartProduct(product)
	map[product.id] = next
	setCartMap(map)
	return { ok: true, count: next }
}

export function setCartItemCount(productId, count) {
	const map = getCartMap()
	const id = String(productId)
	const next = Number(count || 0)
	if (next <= 0) {
		delete map[id]
	} else {
		map[id] = next
	}
	setCartMap(map)
	return map
}
