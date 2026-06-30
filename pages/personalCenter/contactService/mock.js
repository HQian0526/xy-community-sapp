export const contactInfo = {
	title: '联系客服',
	slogan: '扫码添加客服微信',
	desc: '工作日 9:00 - 18:00 在线为您服务',
	qrUrl: 'https://xy-social.com/customer-service',
	servicePhone: '400-888-8888',
}

export function getPosterJson(info) {
	return {
		css: {
			width: '600rpx',
			height: '620rpx',
			background: '#f5f5f5'
		},
		views: [
			{
				type: 'view',
				css: {
					left: '0rpx',
					top: '0rpx',
					width: '600rpx',
					height: '620rpx',
					background: 'linear-gradient(180deg, #00a896 0%, #33b9ab 35%, #ffffff 100%)'
				}
			},
			{
				type: 'view',
				css: {
					left: '30rpx',
					top: '40rpx',
					width: '540rpx',
					height: '530rpx',
					background: '#ffffff',
					radius: '24rpx'
				}
			},
			{
				type: 'text',
				text: info.slogan,
				css: {
					left: '50rpx',
					top: '70rpx',
					width: '500rpx',
					color: '#00a896',
					fontSize: '28rpx',
					textAlign: 'center'
				}
			},
			{
				type: 'text',
				text: info.desc,
				css: {
					left: '50rpx',
					top: '120rpx',
					width: '500rpx',
					color: '#999999',
					fontSize: '24rpx',
					textAlign: 'center'
				}
			},
			{
				type: 'view',
				css: {
					left: '50rpx',
					top: '180rpx',
					width: '500rpx',
					height: '2rpx',
					background: '#f0f0f0'
				}
			},
			{
				type: 'qrcode',
				text: info.qrUrl,
				css: {
					left: '190rpx',
					top: '220rpx',
					width: '220rpx',
					height: '220rpx'
				}
			},
		]
	}
}
