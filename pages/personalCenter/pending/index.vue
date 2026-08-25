<template>
	<view class="pending-page">
		<view v-if="displayList.length" class="order-list">
			<view
				v-for="item in displayList"
				:key="item.id"
				class="order-card"
				@click="goDetail(item)"
			>
				<view class="card-header">
					<text class="store-name">{{ item.storeName }}</text>
					<text class="status-tag" :class="'status-' + item.statusType">{{ item.status }}</text>
				</view>

				<view class="goods-detail goods-detail--always">
					<view v-for="(goods, goodsIndex) in item.goods" :key="goodsIndex" class="goods-row">
						<text class="goods-row-name">{{ goods.name }}</text>
						<text class="goods-row-count">x{{ goods.count }}</text>
					</view>
				</view>

				<view class="order-meta">
					<text class="order-time">{{ item.createTime }}</text>
					<view class="order-amount">
						<text class="amount-value">¥{{ formatMoney(item.payTotal) }}</text>
						<text class="amount-label">共{{ getGoodsCount(item.goods) }}件</text>
					</view>
				</view>

				<view class="card-footer">
					<text class="order-no">订单号：{{ item.orderNo }}</text>
					<text class="expand-btn" @click.stop="goDetail(item)">查看详情</text>
				</view>
			</view>
			<view class="list-footer">已经到底了～</view>
		</view>

		<view v-else class="empty-wrap">
			<u-empty text="暂无进行中订单" mode="order"></u-empty>
		</view>
	</view>
</template>

<script>
	import { formatMoney } from '../storeOrder/mock.js'
	import {
		findMallOrderApi,
		mapMallOrderCard,
		goMallOrderDetail
	} from '@/common/api/mall/order.js'
	import { requireLogin } from '@/common/auth.js'

	export default {
		data() {
			return {
				orders: []
			}
		},
		computed: {
			displayList() {
				return this.orders
			}
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			this.loadOrders()
		},
		onPullDownRefresh() {
			this.loadOrders().finally(() => uni.stopPullDownRefresh())
		},
		methods: {
			formatMoney,
			async loadOrders() {
				try {
					// 进行中/待处理：待支付
					const data = await findMallOrderApi({
						payStatus: 0,
						pageNum: 1,
						pageSize: 100
					})
					this.orders = (data?.list || []).map(mapMallOrderCard)
				} catch (e) {
					console.error('加载进行中订单失败', e)
					this.orders = []
				}
			},
			getGoodsCount(goods = []) {
				return goods.reduce((sum, item) => sum + Number(item.count || 0), 0)
			},
			goDetail(item) {
				goMallOrderDetail(item?.orderNo)
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.pending-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.order-list {
		padding-bottom: 40rpx;
	}

	.order-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		padding-bottom: 16rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.store-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.status-tag {
		flex-shrink: 0;
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		border-width: 1rpx;
		border-style: solid;
	}

	.status-pending {
		color: #ff6034;
		border-color: #ff6034;
	}

	.status-delivering {
		color: #007aff;
		border-color: #007aff;
	}

	.goods-detail {
		padding: 16rpx 20rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;

		&--always {
			margin-top: 0;
		}
	}

	.goods-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24rpx;
		padding: 12rpx 0;

		& + .goods-row {
			border-top: 1rpx solid #eee;
		}
	}

	.goods-row-name {
		flex: 1;
		min-width: 0;
		font-size: 26rpx;
		color: #666;
		line-height: 1.4;
	}

	.goods-row-count {
		flex-shrink: 0;
		font-size: 26rpx;
		color: #999;
	}

	.order-meta {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20rpx;
		margin-top: 20rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.order-time {
		font-size: 24rpx;
		color: #999;
	}

	.order-amount {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
	}

	.amount-value {
		font-size: 32rpx;
		font-weight: 700;
		color: #ff6034;
		line-height: 1;
	}

	.amount-label {
		font-size: 22rpx;
		color: #999;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 20rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.order-no {
		flex: 1;
		min-width: 0;
		font-size: 24rpx;
		color: #999;
	}

	.expand-btn {
		flex-shrink: 0;
		margin-left: 16rpx;
		font-size: 26rpx;
		color: $primary;
	}

	.list-footer {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		padding: 24rpx 0;
	}

	.empty-wrap {
		padding-top: 160rpx;
	}
</style>
