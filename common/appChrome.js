/** 自绘顶栏 / 底栏的选中态和首页 Tab 文案。 */

export const TAB_LIST = [
	{ name: 'mall', path: '/pages/mall/index', icon: 'home', activeIcon: 'home-fill', text: '逛店' },
	{ name: 'intro', path: '/pages/otherBusiness/index', icon: 'info-circle', activeIcon: 'info-circle-fill', text: '本店介绍' },
	{ name: 'order', path: '/pages/personalCenter/storeOrder/index', icon: 'order', activeIcon: 'order', text: '订单' },
	{ name: 'mine', path: '/pages/personalCenter/index', icon: 'account', activeIcon: 'account-fill', text: '我的' }
]

const TITLE_MAP = {
	'pages/mall/index': '',
	'pages/otherBusiness/index': '本店介绍',
	'pages/personalCenter/index': '我的',
	'pages/personalCenter/storeOrder/index': '全部订单',
	'pages/personalCenter/personInfo/index': '资料设置',
	'pages/personalCenter/identity/index': '实名认证',
	'pages/personalCenter/personAgreement/index': '隐私协议',
	'pages/personalCenter/share/index': '分享赚佣',
	'pages/personalCenter/businessInfo/index': '商家资料',
	'pages/personalCenter/businessAgreement/index': '服务协议',
	'pages/personalCenter/contactService/index': '联系客服',
	'pages/personalCenter/blacklist/index': '黑名单',
	'pages/personalCenter/customerlist/index': '顾客列表',
	'pages/personalCenter/customerRecharge/index': '顾客储值',
	'pages/personalCenter/otherBusinessSetting/index': '更多业务',
	'pages/personalCenter/otherBusinessSetting/form/index': '新增业务',
	'pages/personalCenter/businessStatus/index': '营业状态',
	'pages/personalCenter/storeProfile/index': '商家资料',
	'pages/personalCenter/contract/index': '店铺合同',
	'pages/personalCenter/contract/detail': '合同详情',
	'pages/personalCenter/finance/index': '流水查询',
	'pages/personalCenter/monthlyReport/index': '月度报表',
	'pages/personalCenter/pending/index': '待处理',
	'pages/personalCenter/verify/index': '核验',
	'pages/personalCenter/cancel/index': '取消工单',
	'pages/personalCenter/complete/index': '确认完成',
	'pages/personalCenter/finished/index': '已完成',
	'pages/personalCenter/transfer/index': '店铺转让',
	'pages/personalCenter/transferAgreement/index': '店铺转让规则',
	'pages/personalCenter/recharge/index': '会员储值',
	'pages/personalCenter/storeRecharge/index': '店铺储值',
	'pages/personalCenter/withdraw/index': '提现',
	'pages/mall/checkout/index': '确认订单',
	'pages/mall/productDetail/index': '商品详情',
	'pages/mall/cart/index': '购物车',
	'pages/mall/detail': '订单详情',
	'pages/mall/coupon/index': '我的优惠券',
	'pages/join/index': '加入我们',
	'pages/join/apply/index': '来客信息'
}

let selected = 'mall'
let homeTabText = '逛店'
const listeners = []

function notify() {
	listeners.forEach((fn) => {
		try {
			fn(getAppChrome())
		} catch (e) {
			console.error('chrome listener', e)
		}
	})
}

export function normalizeRoute(route) {
	return String(route || '').replace(/^\//, '').split('?')[0]
}

export function isTabRoute(route) {
	const path = '/' + normalizeRoute(route)
	return TAB_LIST.some((item) => item.path === path)
}

export function tabNameByRoute(route) {
	const path = '/' + normalizeRoute(route)
	const hit = TAB_LIST.find((item) => item.path === path)
	return hit ? hit.name : ''
}

export function titleByRoute(route) {
	return TITLE_MAP[normalizeRoute(route)] || ''
}

export function getAppChrome() {
	return { selected, homeTabText }
}

export function setTabSelected(name) {
	if (!name || selected === name) return
	selected = name
	notify()
}

export function setHomeTabText(text) {
	const next = String(text || '逛店').trim().slice(0, 4) || '逛店'
	if (homeTabText === next) return
	homeTabText = next
	notify()
}

export function onAppChrome(fn) {
	if (typeof fn !== 'function') return () => {}
	listeners.push(fn)
	return () => {
		const i = listeners.indexOf(fn)
		if (i >= 0) listeners.splice(i, 1)
	}
}

export function currentPageRoute() {
	try {
		const pages = getCurrentPages()
		const cur = pages && pages[pages.length - 1]
		return (cur && cur.route) || ''
	} catch (e) {
		return ''
	}
}

export function bumpAppChrome() {
	notify()
}

export function syncTabFromRoute(route) {
	const name = tabNameByRoute(route || currentPageRoute())
	if (name) setTabSelected(name)
	return name
}
