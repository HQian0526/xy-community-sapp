export const DELIVERY_FEE = 0

export const checkoutInfo = {
	storeName: '社区便利店',
	deliveryTip: '预计 30 分钟内送达'
}

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
