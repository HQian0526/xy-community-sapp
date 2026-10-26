export function getDefaultContact() {
	const personInfo = uni.getStorageSync('personInfo')
	return {
		contact: personInfo?.phone || '',
		address: personInfo?.address || ''
	}
}

export function formatMoney(value) {
	return Number(value || 0).toFixed(2)
}
