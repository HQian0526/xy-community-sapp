<template>
	<view class="report-page">
		<view class="summary-card">
			<view class="summary-item">
				<text class="summary-label">近6个月累计收入</text>
				<text class="summary-value">¥{{ formatMoney(reportData.totalIncome) }}</text>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<text class="summary-label">月均收入</text>
				<text class="summary-value summary-value--avg">¥{{ formatMoney(reportData.avgIncome) }}</text>
			</view>
		</view>

		<view class="chart-card">
			<view class="chart-header">
				<text class="chart-title">月度收入趋势</text>
				<text class="chart-tip">近6个月</text>
			</view>

			<view class="ucharts-column">
				<view class="ucharts-plot">
					<view class="ucharts-grid">
						<view v-for="n in 4" :key="n" class="ucharts-grid-line"></view>
					</view>
					<view class="ucharts-bars">
						<view
							v-for="(item, index) in chartColumns"
							:key="item.category"
							class="ucharts-col"
							@click="activeIndex = index"
						>
							<text class="ucharts-label">{{ item.label }}</text>
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
	</view>
</template>

<script>
	import { getMonthlyReportData, formatMoney } from './mock.js'

	export default {
		data() {
			return {
				reportData: getMonthlyReportData(),
				activeIndex: -1
			}
		},
		computed: {
			chartColumns() {
				const series = this.reportData.series?.[0] || { data: [] }
				const categories = this.reportData.categories || []
				const values = series.data || []
				const max = Math.max(...values, 1)
				return categories.map((category, index) => {
					const value = Number(values[index] || 0)
					return {
						category,
						value,
						label: value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value),
						height: Math.round((value / max) * 100)
					}
				})
			}
		},
		methods: {
			formatMoney
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

	.chart-card {
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

	.chart-title {
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

	.ucharts-column {
		width: 100%;
	}

	.ucharts-plot {
		position: relative;
		height: 460rpx;
		padding: 8rpx 8rpx 0;
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
		font-size: 20rpx;
		color: #999;
	}

	.ucharts-bar-track {
		flex: 1;
		width: 36rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.ucharts-bar {
		width: 100%;
		min-height: 8rpx;
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
		font-size: 22rpx;
		color: #666;
	}
</style>
