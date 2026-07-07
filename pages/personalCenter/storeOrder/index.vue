<template>
	<view class="store-order-page">
		<view class="filter-wrap">
			<up-subsection
				mode="button"
				:list="sectionList"
				:current="currentSection"
				activeColor="#00a896"
				inactiveColor="#ffffff"
				bgColor="#00a896"
				@change="handleSectionChange"
			></up-subsection>
		</view>

		<view v-if="displayList.length" class="order-list">
			<view v-for="item in displayList" :key="item.id" class="order-card">
				<view class="card-header">
					<text class="store-name">{{ item.storeName }}</text>
					<text class="status-tag" :class="'status-' + item.statusType">{{ item.status }}</text>
				</view>

				<template v-if="isPendingTab">
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
						<text class="action-btn action-success" @click="handleComplete(item)">确认完成</text>
					</view>
				</template>

				<template v-else>
					<view class="order-summary">
						<view class="summary-info">
							<text class="goods-name">{{ getGoodsSummary(item.goods) }}</text>
							<text class="order-time">{{ item.createTime }}</text>
						</view>
						<view class="order-amount">
							<text class="amount-value">¥{{ formatMoney(item.payTotal) }}</text>
							<text class="amount-label">共{{ getGoodsCount(item.goods) }}件</text>
						</view>
					</view>

					<view v-if="isExpanded(item.id)" class="goods-detail">
						<view v-for="(goods, goodsIndex) in item.goods" :key="goodsIndex" class="goods-row">
							<text class="goods-row-name">{{ goods.name }}</text>
							<text class="goods-row-count">x{{ goods.count }}</text>
						</view>
					</view>

					<view class="card-footer">
						<text class="order-no">订单号：{{ item.orderNo }}</text>
						<text class="expand-btn" @click="toggleExpand(item.id)">
							{{ isExpanded(item.id) ? '收起' : '展开' }}
						</text>
					</view>
				</template>
			</view>
			<view class="list-footer">已经到底了～</view>
		</view>

		<view v-else class="empty-wrap">
			<u-empty text="暂无商店订单" mode="order"></u-empty>
		</view>
	</view>
</template>

<script>
	import {
		getStoreOrders,
		filterStoreOrders,
		completeStoreOrder,
		formatMoney,
		getGoodsSummary
	} from './mock.js'

	export default {
		data() {
			return {
				orders: [],
				expandedMap: {},
				currentSection: 0,
				sectionList: [
					{ name: '全部' },
					{ name: '待处理' },
					{ name: '已完成' }
				],
				filterMap: ['all', 'pending', 'finished']
			}
		},
		computed: {
			isPendingTab() {
				return this.currentSection === 1
			},
			displayList() {
				const filterType = this.filterMap[this.currentSection]
				return filterStoreOrders(this.orders, filterType)
			}
		},
		onShow() {
			this.loadOrders()
		},
		onPullDownRefresh() {
			this.loadOrders()
			uni.stopPullDownRefresh()
		},
		methods: {
			formatMoney,
			getGoodsSummary,
			loadOrders() {
				this.orders = getStoreOrders()
			},
			getGoodsCount(goods = []) {
				return goods.reduce((sum, item) => sum + item.count, 0)
			},
			isExpanded(id) {
				return !!this.expandedMap[id]
			},
			toggleExpand(id) {
				this.expandedMap = {
					...this.expandedMap,
					[id]: !this.expandedMap[id]
				}
			},
			handleSectionChange(index) {
				this.currentSection = index
			},
			handleComplete(item) {
				uni.showModal({
					title: '确认完成',
					content: '确认该订单已完成配送吗？',
					success: (res) => {
						if (!res.confirm) return
						this.orders = completeStoreOrder(item.id)
						uni.showToast({
							title: '订单已完成',
							icon: 'success'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.store-order-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.filter-wrap {
		margin-bottom: 20rpx;
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

	.status-finished {
		color: #999;
		border-color: #ccc;
		background-color: #f5f5f5;
	}

	.status-cancelled {
		color: #e64340;
		border-color: #e64340;
	}

	.order-summary {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 20rpx;
	}

	.summary-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.goods-name {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
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

	.goods-detail {
		margin-top: 20rpx;
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

	.action-btn {
		flex-shrink: 0;
		margin-left: 16rpx;
		font-size: 26rpx;
		padding: 10rpx 24rpx;
		border-radius: 30rpx;
		border-width: 1rpx;
		border-style: solid;
	}

	.action-success {
		color: #fff;
		background-color: $primary;
		border-color: $primary;
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
