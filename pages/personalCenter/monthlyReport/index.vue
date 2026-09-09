<template>
	<view class="report-page">
		<view class="summary-card">
			<view class="summary-item">
				<text class="summary-label">{{ year }}年累计收入</text>
				<text class="summary-value">¥{{ formatMoney(totalIncome) }}</text>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<text class="summary-label">月均收入</text>
				<text class="summary-value summary-value--avg">¥{{ formatMoney(avgIncome) }}</text>
			</view>
		</view>

		<view class="chart-card">
			<view class="chart-header">
				<text class="chart-title">月度收入</text>
				<text class="chart-tip">{{ storeName || '本店' }} · {{ year }}年</text>
			</view>

			<view v-if="loading" class="state-wrap">
				<text class="state-text">加载中...</text>
			</view>
			<view v-else class="ucharts-column">
				<view class="ucharts-plot">
					<view class="ucharts-grid">
						<view v-for="n in 4" :key="n" class="ucharts-grid-line"></view>
					</view>
					<view class="ucharts-bars">
						<view
							v-for="(item, index) in chartColumns"
							:key="item.month"
							class="ucharts-col"
							@click="activeIndex = index"
						>
							<text class="ucharts-label">{{ item.shortLabel }}</text>
							<view class="ucharts-bar-track">
								<view
									class="ucharts-bar"
									:class="{ 'ucharts-bar--active': activeIndex === index }"
									:style="{ height: item.height + '%' }"
								></view>
							</view>
							<text class="ucharts-cate">{{ item.category }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="month-card">
			<text class="month-title">各月明细</text>
			<view
				v-for="(item, index) in monthList"
				:key="item.month"
				class="month-row"
				:class="{ 'month-row--active': activeIndex === index }"
				@click="activeIndex = index"
			>
				<text class="month-name">{{ item.label }}</text>
				<view class="month-right">
					<text class="month-amount">¥{{ formatMoney(item.netAmount) }}</text>
					<text v-if="Number(item.refundAmount) > 0" class="month-refund">
						退款 ¥{{ formatMoney(item.refundAmount) }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { requireLogin } from '@/common/auth.js'
	import { getMallIncomeFlowApi } from '@/common/api/mall/order.js'

	function formatMoney(value) {
		return Number(value || 0).toFixed(2)
	}

	function monthLabel(period, index) {
		if (period && period.length >= 7) {
			return `${Number(period.slice(5, 7))}月`
		}
		return `${index + 1}月`
	}

	export default {
		data() {
			return {
				year: new Date().getFullYear(),
				storeName: '',
				monthList: [],
				totalIncome: 0,
				avgIncome: 0,
				activeIndex: -1,
				loading: false
			}
		},
		computed: {
			chartColumns() {
				const values = this.monthList.map((item) => Number(item.netAmount || 0))
				const max = Math.max(...values, 1)
				return this.monthList.map((item, index) => {
					const value = Number(item.netAmount || 0)
					return {
						month: item.month,
						category: monthLabel(item.period, index),
						value,
						shortLabel: value >= 1000 ? `${(value / 1000).toFixed(1)}k` : (value > 0 ? String(Math.round(value)) : ''),
						height: Math.round((value / max) * 100)
					}
				})
			}
		},
		async onShow() {
			await this.loadReport()
		},
		methods: {
			formatMoney,
			async loadReport() {
				const ok = await requireLogin({
					force: true
				})
				if (!ok) return

				const year = new Date().getFullYear()
				this.year = year
				this.loading = true
				try {
					const data = await getMallIncomeFlowApi({
						periodType: 'month',
						year
					})
					const list = Array.isArray(data?.list) ? data.list : []
					this.storeName = data?.storeName || ''
					this.monthList = list.map((row, index) => ({
						month: row.period || `${year}-${String(index + 1).padStart(2, '0')}`,
						period: row.period,
						label: row.periodLabel || monthLabel(row.period, index),
						payAmount: Number(row.payAmount || 0),
						refundAmount: Number(row.refundAmount || 0),
						netAmount: Number(row.netAmount || 0)
					}))
					this.totalIncome = Number(data?.summary?.netAmount || 0)
					this.avgIncome = this.monthList.length
						? this.totalIncome / this.monthList.length
						: 0
					const currentMonth = new Date().getMonth()
					this.activeIndex = currentMonth
				} catch (error) {
					console.error('获取月度报表失败', error)
					this.monthList = []
					this.totalIncome = 0
					this.avgIncome = 0
				} finally {
					this.loading = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;
	$bar: #ff6034;

	.report-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
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
		color: $bar;
		line-height: 1;
	}

	.summary-value--avg {
		color: $primary;
	}

	.chart-card,
	.month-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.chart-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.chart-title,
	.month-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		padding-left: 16rpx;
		border-left: 6rpx solid $primary;
	}

	.chart-tip {
		font-size: 24rpx;
		color: #999;
	}

	.state-wrap {
		height: 360rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.state-text {
		font-size: 26rpx;
		color: #999;
	}

	.ucharts-column {
		width: 100%;
	}

	.ucharts-plot {
		position: relative;
		height: 460rpx;
		padding: 8rpx 4rpx 0;
		box-sizing: border-box;
	}

	.ucharts-grid {
		position: absolute;
		left: 0;
		right: 0;
		top: 48rpx;
		bottom: 48rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		pointer-events: none;
	}

	.ucharts-grid-line {
		height: 0;
		border-top: 1px dashed #e8e8e8;
	}

	.ucharts-bars {
		position: relative;
		z-index: 1;
		height: 100%;
		display: flex;
		align-items: stretch;
		justify-content: space-between;
	}

	.ucharts-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}

	.ucharts-label {
		height: 40rpx;
		line-height: 40rpx;
		font-size: 18rpx;
		color: #999;
	}

	.ucharts-bar-track {
		flex: 1;
		width: 22rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.ucharts-bar {
		width: 100%;
		min-height: 6rpx;
		border-radius: 8rpx 8rpx 0 0;
		background: linear-gradient(180deg, #ff8a5b 0%, $bar 100%);
		transition: height 0.35s ease, opacity 0.2s ease;
	}

	.ucharts-bar--active {
		opacity: 0.85;
		background: linear-gradient(180deg, $primary 0%, #00a896 100%);
	}

	.ucharts-cate {
		height: 48rpx;
		line-height: 48rpx;
		font-size: 20rpx;
		color: #666;
	}

	.month-card {
		margin-top: 20rpx;
		padding-bottom: 8rpx;
	}

	.month-title {
		display: block;
		margin-bottom: 8rpx;
	}

	.month-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 22rpx 8rpx;
		border-bottom: 1rpx solid #f3f3f3;
	}

	.month-row--active {
		background-color: rgba(0, 168, 150, 0.06);
		margin: 0 -8rpx;
		padding-left: 16rpx;
		padding-right: 16rpx;
		border-radius: 12rpx;
		border-bottom-color: transparent;
	}

	.month-name {
		font-size: 28rpx;
		color: #333;
	}

	.month-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4rpx;
	}

	.month-amount {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.month-refund {
		font-size: 22rpx;
		color: #e6a23c;
	}
</style>
