export const OTHER_BUSINESS_KEY = 'otherBusinessList'

export const defaultBusinessList = [
	{
		id: '1',
		name: '上门维修',
		description: '家电、水电小维修',
		fee: '50元起/次'
	},
	{
		id: '2',
		name: '代扔垃圾',
		description: '帮扔生活垃圾至指定回收点',
		fee: '5元/袋'
	}
]

export function getOtherBusinessList() {
	const cached = uni.getStorageSync(OTHER_BUSINESS_KEY)
	return cached && cached.length ? cached : [...defaultBusinessList]
}

export function setOtherBusinessList(list) {
	uni.setStorageSync(OTHER_BUSINESS_KEY, list)
}

export function getOtherBusinessById(id) {
	return getOtherBusinessList().find((item) => item.id === id) || null
}

export function saveOtherBusiness(data) {
	const list = getOtherBusinessList()
	const index = list.findIndex((item) => item.id === data.id)
	if (index > -1) {
		list[index] = { ...list[index], ...data }
	} else {
		list.unshift({
			...data,
			id: data.id || String(Date.now())
		})
	}
	setOtherBusinessList(list)
	return list
}

export function deleteOtherBusiness(id) {
	const list = getOtherBusinessList().filter((item) => item.id !== id)
	setOtherBusinessList(list)
	return list
}
