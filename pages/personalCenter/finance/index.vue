<template>
	<view class="finance-page">
		<view class="summary-card">
			<view class="summary-item">
				<text class="summary-label">累计收入</text>
				<text class="summary-value summary-value--income">¥{{ formatMoney(summary.income) }}</text>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<text class="summary-label">累计支出</text>
				<text class="summary-value summary-value--expense">¥{{ formatMoney(summary.expense) }}</text>
			</view>
		</view>

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

		<view v-if="displayList.length" class="record-list">
			<view v-for="item in displayList" :key="item.id" class="record-card">
				<view class="record-main">
					<view class="record-info">
						<text class="record-title">{{ item.title }}</text>
						<text class="record-desc">订单号：{{ item.orderNo }}</text>
						<text class="record-time">{{ item.time }}</text>
					</view>
					<view class="record-right">
						<text
							class="record-amount"
							:class="item.type === 'income' ? 'record-amount--income' : 'record-amount--expense'"
						>
							{{ formatAmountDisplay(item.type, item.amount) }}
						</text>
						<text class="record-status">{{ item.status }}</text>
					</view>
				</view>
			</view>
			<view class="list-footer">已经到底了～</view>
		</view>

		<view v-else class="empty-wrap">
			<u-empty text="暂无流水记录" mode="list"></u-empty>
		</view>
	</view>
</template>

<script>
	import {
		getFinanceRecords,
		getFinanceSummary,
		filterFinanceRecords,
		formatAmountDisplay
	} from './mock.js'

	export default {
		data() {
			return {
				records: [],
				currentSection: 0,
				sectionList: [
					{ name: '全部' },
					{ name: '收入' },
					{ name: '支出' }
				],
				filterMap: ['all', 'income', 'expense']
			}
		},
		computed: {
			displayList() {
				const filterType = this.filterMap[this.currentSection]
				return filterFinanceRecords(this.records, filterType)
			},
			summary() {
				return getFinanceSummary(this.records)
			}
		},
		onShow() {
			this.loadRecords()
		},
		methods: {
			formatAmountDisplay,
			formatMoney(value) {
				return Number(value || 0).toFixed(2)
			},
			loadRecords() {
				this.records = getFinanceRecords()
			},
			handleSectionChange(index) {
				this.currentSection = index
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.finance-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.summary-card {
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.summary-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}

	.summary-divider {
		width: 1rpx;
		height: 64rpx;
		background-color: #eee;
	}

	.summary-label {
		font-size: 24rpx;
		color: #999;
	}

	.summary-value {
		font-size: 36rpx;
		font-weight: 700;
		line-height: 1;
	}

	.summary-value--income {
		color: #ff6034;
	}

	.summary-value--expense {
		color: $primary;
	}

	.filter-wrap {
		margin-bottom: 20rpx;
	}

	.record-list {
		padding-bottom: 40rpx;
	}

	.record-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.record-main {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24rpx;
	}

	.record-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.record-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.record-desc {
		font-size: 26rpx;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.record-time {
		font-size: 24rpx;
		color: #999;
	}

	.record-right {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
	}

	.record-amount {
		font-size: 32rpx;
		font-weight: 700;
		line-height: 1;
	}

	.record-amount--income {
		color: #ff6034;
	}

	.record-amount--expense {
		color: $primary;
	}

	.record-status {
		font-size: 22rpx;
		color: #999;
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
