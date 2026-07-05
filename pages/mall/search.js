function normalizeText(text) {
	return String(text || '').toLowerCase().replace(/\s+/g, '')
}

function fuzzySubsequence(source, keyword) {
	let index = 0
	for (const char of source) {
		if (char === keyword[index]) {
			index += 1
		}
		if (index >= keyword.length) {
			return true
		}
	}
	return false
}

export function matchProductKeyword(product, keyword, categoryName = '') {
	const key = normalizeText(keyword)
	if (!key) {
		return true
	}

	const name = normalizeText(product.name)
	const category = normalizeText(categoryName)

	if (name.includes(key) || category.includes(key)) {
		return true
	}

	return fuzzySubsequence(name, key) || fuzzySubsequence(category, key)
}

export function searchProducts(categoryList, keyword) {
	const key = String(keyword || '').trim()
	if (!key) {
		return []
	}

	const results = []
	categoryList.forEach((category) => {
		category.children.forEach((product) => {
			if (matchProductKeyword(product, key, category.name)) {
				results.push({
					...product,
					categoryName: category.name
				})
			}
		})
	})
	return results
}
