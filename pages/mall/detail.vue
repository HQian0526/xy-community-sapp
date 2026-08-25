<template>
	<view class="order-detail-page">
		<view v-if="loading" class="empty-wrap">
			<u-loading-icon mode="circle" size="36"></u-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<view v-else-if="!order" class="empty-wrap">
			<u-empty text="订单不存在或无权查看" mode="order"></u-empty>
		</view>

		<template v-else>
			<view class="status-card">
				<text class="status-text">{{ payStatusLabel }}</text>
				<text class="order-no">订单号：{{ order.orderNo }}</text>
			</view>

			<view class="info-card">
				<view class="info-row">
					<text class="info-label">联系电话</text>
					<text class="info-value">{{ order.contact || '-' }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">收货地址</text>
					<text class="info-value">{{ order.address || '-' }}</text>
				</view>
				<view v-if="order.remark" class="info-row info-row-last">
					<text class="info-label">备注</text>
					<text class="info-value">{{ order.remark }}</text>
				</view>
			</view>

			<view class="goods-card">
				<view class="card-title">商品明细</view>
				<view v-for="item in order.items || []" :key="item.id" class="goods-item">
					<image
						class="goods-img"
						:src="item.productImg || '/static/image-wrong.png'"
						mode="aspectFill"
					/>
					<view class="goods-info">
						<text class="goods-name">{{ item.productName }}</text>
						<view class="goods-bottom">
							<view class="goods-price">
								<text class="price-symbol">¥</text>
								<text class="price-value">{{ formatMoney(item.price) }}</text>
							</view>
							<text class="goods-count">x{{ item.quantity }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="summary-card">
				<view class="summary-row">
					<text class="summary-label">商品金额</text>
					<text class="summary-value">¥{{ formatMoney(order.goodsAmount) }}</text>
				</view>
				<view class="summary-row">
					<text class="summary-label">配送费</text>
					<text class="summary-value">¥{{ formatMoney(order.deliveryFee) }}</text>
				</view>
				<view class="summary-row summary-row-total">
					<text class="summary-label">实付</text>
					<text class="summary-total">¥{{ formatMoney(order.payAmount) }}</text>
				</view>
			</view>

			<view v-if="order.transactionId || order.paidTime" class="info-card">
				<view v-if="order.transactionId" class="info-row">
					<text class="info-label">支付单号</text>
					<text class="info-value">{{ order.transactionId }}</text>
				</view>
				<view v-if="order.paidTime" class="info-row info-row-last">
					<text class="info-label">支付时间</text>
					<text class="info-value">{{ formatTime(order.paidTime) }}</text>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	import { requireLogin } from '@/common/auth.js'
	import { queryMallOrderApi } from '@/common/api/mall/order.js'
	import { formatMoney } from './checkout/mock.js'

	const PAY_STATUS_MAP = {
		0: '待支付',
		1: '已支付',
		2: '已关闭'
	}

	export default {
		data() {
			return {
				loading: true,
				orderNo: '',
				order: null
			}
		},
		computed: {
			payStatusLabel() {
				const status = Number(this.order?.payStatus)
				return PAY_STATUS_MAP[status] || '未知状态'
			}
		},
		async onLoad(options = {}) {
			// 微信订单中心会把 ${商品订单号} 替换为 out_trade_no
			this.orderNo = decodeURIComponent(
				options.orderNo || options.id || options.out_trade_no || ''
			).trim()
			if (!(await requireLogin({ force: true }))) {
				this.loading = false
				return
			}
			await this.loadOrder()
		},
		onPullDownRefresh() {
			this.loadOrder().finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		methods: {
			formatMoney,
			formatTime(value) {
				if (!value) return '-'
				const date = new Date(value)
				if (Number.isNaN(date.getTime())) return String(value)
				const pad = (n) => String(n).padStart(2, '0')
				return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
			},
			async loadOrder() {
				if (!this.orderNo) {
					this.order = null
					this.loading = false
					uni.showToast({ title: '缺少订单号', icon: 'none' })
					return
				}
				this.loading = true
				try {
					const data = await queryMallOrderApi(this.orderNo)
					this.order = data?.order || null
				} catch (e) {
					console.error('加载商城订单失败', e)
					this.order = null
				} finally {
					this.loading = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.order-detail-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.empty-wrap {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.loading-text {
		font-size: 26rpx;
		color: #999;
	}

	.status-card,
	.info-card,
	.goods-card,
	.summary-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.status-text {
		display: block;
		font-size: 36rpx;
		font-weight: 700;
		color: $primary;
		margin-bottom: 12rpx;
	}

	.order-no {
		font-size: 24rpx;
		color: #999;
		word-break: break-all;
	}

	.info-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24rpx;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.info-row-last {
		border-bottom: none;
		padding-bottom: 0;
	}

	.info-label {
		flex-shrink: 0;
		font-size: 28rpx;
		color: #666;
	}

	.info-value {
		flex: 1;
		text-align: right;
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		word-break: break-all;
	}

	.card-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}

	.goods-item {
		display: flex;
		align-items: flex-start;
		padding: 16rpx 0;

		& + .goods-item {
			border-top: 1rpx solid #f5f5f5;
		}
	}

	.goods-img {
		flex-shrink: 0;
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		background-color: #f8f8f8;
	}

	.goods-info {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 120rpx;
	}

	.goods-name {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
	}

	.goods-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 12rpx;
	}

	.goods-price {
		display: flex;
		align-items: baseline;
	}

	.price-symbol {
		font-size: 22rpx;
		color: #ff6034;
		font-weight: 600;
	}

	.price-value {
		font-size: 30rpx;
		color: #ff6034;
		font-weight: 700;
	}

	.goods-count {
		font-size: 26rpx;
		color: #999;
	}

	.summary-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
		font-size: 28rpx;
	}

	.summary-row-total {
		margin-bottom: 0;
		padding-top: 16rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.summary-label {
		color: #666;
	}

	.summary-value {
		color: #333;
	}

	.summary-total {
		font-size: 36rpx;
		font-weight: 700;
		color: #ff6034;
	}
</style>
