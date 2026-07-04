export const storeInfo = {
	avatar: 'http://106.55.6.194:8999/xy-community/girl.png',
	storeName: '用户9527',
	phone: '188****8888',
	status: '营业中',
	totalAssets: 797.11,
	yesterdayIncome: 0
}

export const accountList = [
	{ key: 'storeOrder', name: '商店订单', icon: 'bag', url: '/pages/personalCenter/storeOrder/index' },
	// { key: 'payment', name: '提现', icon: 'rmb-circle', url: '/pages/personalCenter/withdraw/index' },
	{ key: 'finance', name: '流水查询', icon: 'file-text', url: '/pages/personalCenter/finance/index' },
	{ key: 'info', name: '待处理', icon: 'info-circle', url: '/pages/personalCenter/pending/index' },
	{ key: 'agreement', name: '已完成', icon: 'checkbox-mark', url: '/pages/personalCenter/finished/index' },
]

export const serviceList = [
	{ key: 'info', name: '资料完善', icon: 'order', url: '/pages/personalCenter/personInfo/index' },
	{ key: 'identity', name: '实名认证', icon: 'account', url: '/pages/personalCenter/identity/index' },
	{ key: 'agreement', name: '隐私协议', icon: 'question-circle', url: '/pages/personalCenter/personAgreement/index' },
	{ key: 'share', name: '分享赚佣', icon: 'share', url: '/pages/personalCenter/share/index' },
]

export const ownerList = [
	{ key: 'businessInfo', name: '商家资料', icon: 'integral', url: '/pages/personalCenter/businessInfo/index' },
	{ key: 'status', name: '营业状态', icon: 'star', url: '/pages/personalCenter/businessStatus/index' },
	{ key: 'blacklist', name: '黑名单', icon: 'close-circle', url: '/pages/personalCenter/blacklist/index' },
	{ key: 'agreement', name: '服务协议', icon: 'question-circle', url: '/pages/personalCenter/businessAgreement/index' },
	{ key: 'help', name: '联系客服', icon: 'kefu-ermai', url: '/pages/personalCenter/contactService/index' },
]
