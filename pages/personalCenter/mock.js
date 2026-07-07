export const storeInfo = {
	avatar: 'https://www.gzstarfly.com/xy-community/girl.png',
	storeName: '用户9527',
	phone: '188****8888',
	status: '营业中',
	totalAssets: 797.11,
	yesterdayIncome: 0
}

// 商家端
export const businessList = [
	{ key: 'storeOrder', name: '所有订单', icon: 'bag', url: '/pages/personalCenter/storeOrder/index' },
	{ key: 'info', name: '待处理', icon: 'info-circle', url: '/pages/personalCenter/pending/index' },
	{ key: 'finance', name: '流水查询', icon: 'file-text', url: '/pages/personalCenter/finance/index' },
	{ key: 'chart', name: '月度报表', icon: 'calendar', url: '/pages/personalCenter/monthlyReport/index' },
]

export const accountList = [
	{ key: 'storeOrder', name: '所有订单', icon: 'bag', url: '/pages/personalCenter/storeOrder/index' },
	// { key: 'payment', name: '提现', icon: 'rmb-circle', url: '/pages/personalCenter/withdraw/index' },
	// { key: 'finance', name: '流水查询', icon: 'file-text', url: '/pages/personalCenter/finance/index' },
	{ key: 'info', name: '进行中', icon: 'info-circle', url: '/pages/personalCenter/pending/index' },
	{ key: 'agreement', name: '已完成', icon: 'checkbox-mark', url: '/pages/personalCenter/finished/index' },
	{ key: 'phone', name: '联系店家', icon: 'chat', url: '/pages/personalCenter/contactService/index' },
]

export const serviceList = [
	// { key: 'info', name: '资料完善', icon: 'order', url: '/pages/personalCenter/personInfo/index' },
	// { key: 'identity', name: '实名认证', icon: 'account', url: '/pages/personalCenter/identity/index' },
	{ key: 'agreement', name: '隐私协议', icon: 'question-circle', url: '/pages/personalCenter/personAgreement/index' },
	{ key: 'share', name: '分享小程序', icon: 'share' },
]

export const ownerList = [
	// { key: 'businessInfo', name: '商家资料', icon: 'integral', url: '/pages/personalCenter/businessInfo/index' },
	{ key: 'status', name: '营业状态', icon: 'star', url: '/pages/personalCenter/businessStatus/index' },
	{ key: 'otherBusiness', name: '更多业务', icon: 'more-circle', url: '/pages/personalCenter/otherBusinessSetting/index' },
	{ key: 'blacklist', name: '黑名单', icon: 'close-circle', url: '/pages/personalCenter/blacklist/index' },
	{ key: 'agreement', name: '服务协议', icon: 'question-circle', url: '/pages/personalCenter/businessAgreement/index' },
	// { key: 'change', name: '店铺转让', icon: 'pushpin', url: '/pages/personalCenter/transfer/index' },
	{ key: 'help', name: '联系客服', icon: 'kefu-ermai', url: '/pages/personalCenter/contactService/index' },
]
