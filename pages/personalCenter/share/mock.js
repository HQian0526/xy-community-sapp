export const shareInfo = {
	inviteCode: 'USER9527',
	inviteUrl: 'https://xy-social.com/invite?code=USER9527',
	userName: '用户9527',
	slogan: '邀请好友 分享赚佣',
	desc: '好友下单，你赚佣金'
}

export function getPosterJson(info) {
	return {
		css: {
			width: '600rpx',
			height: '820rpx',
			background: '#f5f5f5'
		},
		views: [
			{
				type: 'view',
				css: {
					left: '0rpx',
					top: '0rpx',
					width: '600rpx',
					height: '820rpx',
					background: 'linear-gradient(180deg, #00a896 0%, #33b9ab 35%, #ffffff 100%)'
				}
			},
			{
				type: 'view',
				css: {
					left: '30rpx',
					top: '40rpx',
					width: '540rpx',
					height: '730rpx',
					background: '#ffffff',
					radius: '24rpx'
				}
			},
			{
				type: 'image',
				src: 'http://106.55.6.194:8999/xy-community/banner.png',
				css: {
					left: '50rpx',
					top: '60rpx',
					width: '500rpx',
					height: '300rpx',
					radius: '16rpx'
				}
			},
			{
				type: 'text',
				text: `邀请人：${info.userName}`,
				css: {
					left: '50rpx',
					top: '400rpx',
					color: '#999999',
					fontSize: '26rpx'
				}
			},
			{
				type: 'text',
				text: '长按识别二维码，立即加入',
				css: {
					left: '50rpx',
					top: '450rpx',
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
					top: '490rpx',
					width: '500rpx',
					height: '2rpx',
					background: '#f0f0f0'
				}
			},
			{
				type: 'qrcode',
				text: info.inviteUrl,
				css: {
					left: '190rpx',
					top: '520rpx',
					width: '220rpx',
					height: '220rpx'
				}
			},
		]
	}
}
