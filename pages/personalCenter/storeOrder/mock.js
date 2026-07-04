import { checkoutInfo, DELIVERY_FEE } from '../../mall/checkout/mock.js'

export const STORE_ORDER_STORAGE_KEY = 'storeOrders'
export const STORE_NAME = checkoutInfo.storeName

export const statusMap = {
	all: '全部',
	pending: '待配送',
	delivering: '配送中',
	finished: '已完成',
	cancelled: '已取消'
}

export const storeOrderList = [
	{
		id: '1001',
		orderNo: 'M20250902103015001',
		storeName: STORE_NAME,
		status: '待配送',
		statusType: 'pending',
		createTime: '2025-09-02 10:30:15',
		address: '上海-汤臣一品 3栋2单元801',
		contact: '13710088789',
		remark: '放门口即可',
		goods: [
			{ id: '1', name: '农夫山泉 550ml', price: 2, count: 2, icon: '' },
			{ id: '3', name: '乐事原味薯片 70g', price: 6.9, count: 1, icon: '' }
		],
		goodsTotal: 10.9,
		deliveryFee: DELIVERY_FEE,
		payTotal: 10.9
	},
	{
		id: '1002',
		orderNo: 'M20250901184522002',
		storeName: STORE_NAME,
		status: '配送中',
		statusType: 'delivering',
		createTime: '2025-09-01 18:45:22',
		address: '上海-汤臣一品 5栋1单元1203',
		contact: '13800138000',
		remark: '',
		goods: [
			{ id: '5', name: '可口可乐 330ml', price: 3, count: 4, icon: '' },
			{ id: '10', name: '卫龙大面筋', price: 3.5, count: 2, icon: '' }
		],
		goodsTotal: 19,
		deliveryFee: DELIVERY_FEE,
		payTotal: 19
	},
	{
		id: '1003',
		orderNo: 'M20250828161208003',
		storeName: STORE_NAME,
		status: '已完成',
		statusType: 'finished',
		createTime: '2025-08-28 16:12:08',
		address: '上海-汤臣一品 2栋3单元502',
		contact: '13900139000',
		remark: '',
		goods: [
			{ id: '13', name: '维达抽纸 3包', price: 9.9, count: 1, icon: '' }
		],
		goodsTotal: 9.9,
		deliveryFee: DELIVERY_FEE,
		payTotal: 9.9
	}
]

function formatNow() {
	const date = new Date()
	const pad = (n) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function generateOrderNo() {
	return `M${Date.now()}`
}

export function getStoreOrders() {
	const cached = uni.getStorageSync(STORE_ORDER_STORAGE_KEY)
	const list = cached && cached.length ? cached : [...storeOrderList]
	return list.filter(item => item.storeName === STORE_NAME)
}

export function setStoreOrders(list) {
	uni.setStorageSync(STORE_ORDER_STORAGE_KEY, list)
}

export function addStoreOrder(orderData) {
	const order = {
		id: String(Date.now()),
		orderNo: generateOrderNo(),
		storeName: STORE_NAME,
		status: '待配送',
		statusType: 'pending',
		createTime: formatNow(),
		...orderData
	}
	const list = getStoreOrders().filter(item => item.storeName === STORE_NAME)
	setStoreOrders([order, ...list])
	return order
}

export function filterStoreOrders(orders, filterType) {
	if (!filterType || filterType === 'all') {
		return orders
	}
	return orders.filter(item => item.statusType === filterType)
}

export function formatMoney(value) {
	return Number(value || 0).toFixed(2)
}

export function getGoodsSummary(goods = []) {
	const count = goods.reduce((sum, item) => sum + item.count, 0)
	const firstName = goods[0]?.name || ''
	if (goods.length <= 1) {
		return firstName
	}
	return `${firstName} 等${count}件商品`
}
