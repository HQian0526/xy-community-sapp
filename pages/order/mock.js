export const orderList = [
	{
		id: '1',
		companyName: '帮拿快递',
		status: '已派单',
		statusType: 'dispatched',
		faultType: '取件',
		submitTime: '2025-09-02 10:12:27',
		equipment: '测试单子',
		faultLevel: '严重故障',
		description: '去驿站取，放到家门口的鞋柜上',
		orderCode: '8651039100182298624',
		reporter: 'test',
		phone: '13710088789',
		address: '冲冲冲',
		repairer: '小红',
		startCode: '981729',
		price: 2
	},
	{
		id: '2',
		companyName: '逛商场的帮忙带瓶花生油',
		status: '派单中',
		statusType: 'dispatching',
		faultType: '代购',
		submitTime: '2025-09-02 10:12:27',
		equipment: '测试单子',
		faultLevel: '风险警告',
		description: '任意超市商场都行，主要是我懒',
		orderCode: '8651039100182298625',
		reporter: 'test',
		phone: '13710088789',
		address: '冲冲冲',
		repairer: '小红',
		startCode: '981729',
		price: 5
	},
	{
		id: '3',
		companyName: '有会修洗衣机的吗',
		status: '已派单',
		statusType: 'dispatched',
		faultType: '维修',
		submitTime: '2025-09-02 10:12:27',
		equipment: '测试单子',
		faultLevel: '严重故障',
		description: '纯纯粹粹纯纯粹粹吃',
		orderCode: '8651039100182298626',
		reporter: 'test',
		phone: '13710088789',
		address: '冲冲冲',
		repairer: '小红',
		startCode: '981729',
		price: 100
	},
	{
		id: '4',
		companyName: '上门安装openclaw小龙虾',
		status: '已派单',
		statusType: 'dispatched',
		faultType: '其他',
		submitTime: '2025-09-02 10:12:27',
		equipment: '测试单子',
		faultLevel: '严重故障',
		description: '纯纯粹粹纯纯粹粹吃',
		orderCode: '8651039100182298626',
		reporter: 'test',
		phone: '13710088789',
		address: '冲冲冲',
		repairer: '小红',
		startCode: '981729',
		price: 398
	}
]

export const ORDER_STORAGE_KEY = 'orderList'

export function getOrderList() {
	const cached = uni.getStorageSync(ORDER_STORAGE_KEY)
	return cached && cached.length ? cached : [...orderList]
}

export function setOrderList(list) {
	uni.setStorageSync(ORDER_STORAGE_KEY, list)
}

export function removeOrder(id) {
	const list = getOrderList().filter(item => item.id !== id)
	setOrderList(list)
	return list
}

export function getOrderById(id) {
	const list = getOrderList()
	return list.find(item => item.id === id) || list[0]
}
