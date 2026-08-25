import {
	get,
	post
} from '../request.js'

/**
 * 商城下单并获取微信支付调起参数
 * @param {Object} data { contact, address, remark, items:[{ productId, quantity }] }
 */
export function checkoutAndPayApi(data) {
	return post('/mallOrder/checkoutAndPay', data, {
		loading: true,
		loadingText: '正在下单...'
	})
}

/**
 * 查询商城订单（支付后确认）
 * @param {string} orderNo
 */
export function queryMallOrderApi(orderNo) {
	return get('/mallOrder/queryOrder', {
		orderNo
	})
}

/**
 * 商城订单列表
 * @param {Object} [params] payStatus、pageNum、pageSize
 */
export function findMallOrderApi(params) {
	return get('/mallOrder/findMallOrder', params || {})
}

/**
 * 将后端订单转为列表卡片结构
 */
export function mapMallOrderCard(order) {
	const payStatus = Number(order?.payStatus)
	const statusMeta = {
		0: { status: '待支付', statusType: 'pending' },
		1: { status: '已支付', statusType: 'delivering' },
		2: { status: '已关闭', statusType: 'cancelled' }
	}[payStatus] || { status: '未知', statusType: 'cancelled' }

	const goods = (order?.items || []).map((item) => ({
		id: item.id || item.productId,
		name: item.productName,
		price: item.price,
		count: item.quantity,
		icon: item.productImg || ''
	}))

	return {
		id: order.id,
		orderNo: order.orderNo,
		storeName: order.storeName || '店铺',
		status: statusMeta.status,
		statusType: statusMeta.statusType,
		payStatus,
		createTime: formatOrderTime(order.createdTime),
		address: order.address || '',
		contact: order.contact || '',
		remark: order.remark || '',
		goods,
		goodsTotal: order.goodsAmount,
		deliveryFee: order.deliveryFee,
		payTotal: order.payAmount
	}
}

function formatOrderTime(value) {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return String(value)
	const pad = (n) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function goMallOrderDetail(orderNo) {
	if (!orderNo) return
	uni.navigateTo({
		url: `/pages/mall/detail?orderNo=${encodeURIComponent(orderNo)}`
	})
}

/**
 * mock 模式确认支付（仅后端 wechat.pay.mock=true）
 * @param {string} orderNo
 */
export function mockConfirmMallPayApi(orderNo) {
	return post('/mallOrder/mockConfirmPay', {
		orderNo
	}, {
		loading: true,
		loadingText: '确认支付中...'
	})
}

/**
 * 调起微信支付；返回 Promise
 */
export function requestWxPayment(payParams) {
	return new Promise((resolve, reject) => {
		uni.requestPayment({
			provider: 'wxpay',
			timeStamp: String(payParams.timeStamp || ''),
			nonceStr: payParams.nonceStr || '',
			package: payParams.packageValue || payParams.package || '',
			signType: payParams.signType || 'RSA',
			paySign: payParams.paySign || '',
			success: (res) => resolve(res),
			fail: (err) => reject(err)
		})
	})
}

/**
 * 轮询查单，直到已支付或超时
 */
export async function waitMallOrderPaid(orderNo, {
	times = 5,
	intervalMs = 800
} = {}) {
	let last = null
	for (let i = 0; i < times; i++) {
		last = await queryMallOrderApi(orderNo)
		const status = Number(last?.order?.payStatus)
		if (status === 1) {
			return last
		}
		if (i < times - 1) {
			await new Promise((r) => setTimeout(r, intervalMs))
		}
	}
	return last
}
