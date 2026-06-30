export const storeInfo = {
	avatar: '/static/userInfo/boy.png',
	storeName: '用户9527',
	phone: '188****8888',
	status: '营业中',
	totalAssets: 797.11,
	yesterdayIncome: 0
}

export const accountList = [
	{ key: 'payment', name: '提现', icon: 'rmb-circle' },
	{ key: 'finance', name: '流水查询', icon: 'order' },
	{ key: 'info', name: '待处理', icon: 'info-circle' },
	{ key: 'agreement', name: '已完成', icon: 'checkbox-mark' },
]

export const serviceList = [
	{ key: 'info', name: '资料完善', icon: 'order', url: '/pages/personalCenter/personInfo/index' },
	{ key: 'identity', name: '实名认证', icon: 'account', url: '/pages/personalCenter/identity/index' },
	{ key: 'agreement', name: '隐私协议', icon: 'question-circle', url: '/pages/personalCenter/personAgreement/index' },
	{ key: 'share', name: '分享赚佣', icon: 'share', url: '/pages/personalCenter/share/index' },
]

export const ownerList = [
	{ key: 'businessInfo', name: '商家资料', icon: 'order', url: '/pages/personalCenter/businessInfo/index' },
	{ key: 'kind', name: '商城分类', icon: 'setting' },
	{ key: 'product', name: '货品修改', icon: 'coupon' },
	{ key: 'agreement', name: '服务协议', icon: 'question-circle', url: '/pages/personalCenter/businessAgreement/index' },
	{ key: 'help', name: '联系客服', icon: 'kefu-ermai', url: '/pages/personalCenter/contactService/index' },
]
