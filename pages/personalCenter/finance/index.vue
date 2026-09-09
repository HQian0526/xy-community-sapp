<template>
	<view class="finance-page">
		<view class="date-bar" @click="openDatePicker">
			<text class="date-text">{{ dateLabel }}</text>
			<u-icon name="arrow-down" size="14" color="#666"></u-icon>
		</view>

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

		<view v-if="loading && !records.length" class="empty-wrap">
			<text class="loading-text">加载中...</text>
		</view>
		<view v-else-if="records.length" class="record-list">
			<view v-for="item in records" :key="item.id" class="record-card">
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
			<view class="list-footer">
				<view v-if="loadingMore" class="footer-loading">
					<u-loading-icon mode="circle" size="16" color="#00a896"></u-loading-icon>
					<text class="footer-loading-text">加载中...</text>
				</view>
				<text v-else-if="noMore">已经到底了～</text>
			</view>
		</view>

		<view v-else class="empty-wrap">
			<u-empty text="暂无流水记录" mode="list"></u-empty>
		</view>

		<u-datetime-picker
			:show="dateShow"
			:value="dateValue"
			mode="date"
			:minDate="minDate"
			:maxDate="maxDate"
			confirmColor="#00a896"
			title="选择日期"
			@confirm="onDateConfirm"
			@cancel="dateShow = false"
			@close="dateShow = false"
		></u-datetime-picker>
	</view>
</template>

<script>
	import { requireLogin } from '@/common/auth.js'
	import { getMallFinanceLedgerApi } from '@/common/api/mall/order.js'
	import { formatAmountDisplay } from './mock.js'

	const PAGE_SIZE = 10

	function pad(n) {
		return String(n).padStart(2, '0')
	}

	function toDateText(value) {
		const date = value instanceof Date ? value : new Date(value)
		if (Number.isNaN(date.getTime())) return ''
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
	}

	function toDateLabel(text) {
		const parts = String(text || '').split('-')
		if (parts.length < 3) return text
		return `${Number(parts[0])}年${Number(parts[1])}月${Number(parts[2])}日`
	}

	export default {
		data() {
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			return {
				records: [],
				summaryIncome: 0,
				summaryExpense: 0,
				loading: false,
				loadingMore: false,
				pageNum: 1,
				total: 0,
				currentSection: 0,
				sectionList: [
					{ name: '全部' },
					{ name: '收入' },
					{ name: '支出' }
				],
				filterMap: ['all', 'income', 'expense'],
				selectedDate: toDateText(today),
				dateValue: today.getTime(),
				dateShow: false,
				minDate: new Date('2020-01-01').getTime(),
				maxDate: Date.now(),
			}
		},
		computed: {
			dateLabel() {
				return toDateLabel(this.selectedDate)
			},
			summary() {
				return {
					income: this.summaryIncome,
					expense: this.summaryExpense
				}
			},
			noMore() {
				return this.records.length >= this.total
			}
		},
		async onShow() {
			const ok = await requireLogin({
				force: true
			})
			if (!ok) return
			await this.reload()
		},
		onReachBottom() {
			this.loadMore()
		},
		methods: {
			formatAmountDisplay,
			formatMoney(value) {
				return Number(value || 0).toFixed(2)
			},
			openDatePicker() {
				this.dateShow = true
			},
			onDateConfirm(e) {
				const value = e?.value || this.dateValue
				this.dateValue = value
				this.selectedDate = toDateText(value)
				this.dateShow = false
				this.reload()
			},
			handleSectionChange(index) {
				this.currentSection = index
				this.reload()
			},
			async reload() {
				this.pageNum = 1
				this.records = []
				this.total = 0
				await this.fetchPage(false)
			},
			async loadMore() {
				if (this.loading || this.loadingMore || this.noMore) return
				this.pageNum += 1
				await this.fetchPage(true)
			},
			async fetchPage(append) {
				if (append) {
					this.loadingMore = true
				} else {
					this.loading = true
				}
				try {
					const data = await getMallFinanceLedgerApi({
						date: this.selectedDate,
						type: this.filterMap[this.currentSection],
						pageNum: this.pageNum,
						pageSize: PAGE_SIZE
					})
					const list = Array.isArray(data?.list) ? data.list : []
					this.total = Number(data?.total || 0)
					this.summaryIncome = Number(data?.summary?.income || 0)
					this.summaryExpense = Number(data?.summary?.expense || 0)
					this.records = append ? this.records.concat(list) : list
					if (append && !list.length) {
						this.pageNum = Math.max(1, this.pageNum - 1)
					}
				} catch (error) {
					console.error('获取流水失败', error)
					if (append) {
						this.pageNum = Math.max(1, this.pageNum - 1)
					} else {
						this.records = []
						this.total = 0
						this.summaryIncome = 0
						this.summaryExpense = 0
					}
				} finally {
					this.loading = false
					this.loadingMore = false
				}
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
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.date-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		height: 72rpx;
		margin-bottom: 16rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.date-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
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
		padding: 24rpx 0 40rpx;
	}

	.footer-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}

	.footer-loading-text {
		font-size: 24rpx;
		color: #999;
	}

	.empty-wrap {
		padding-top: 160rpx;
	}

	.loading-text {
		display: block;
		text-align: center;
		font-size: 26rpx;
		color: #999;
	}
</style>
