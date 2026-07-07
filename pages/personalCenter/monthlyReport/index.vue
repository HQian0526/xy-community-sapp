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
			<view class="chart-wrap">
				<!-- #ifdef MP-ALIPAY -->
				<canvas
					canvas-id="monthlyIncomeChart"
					id="monthlyIncomeChart"
					class="chart-canvas"
					:width="cWidth * pixelRatio"
					:height="cHeight * pixelRatio"
					:style="{ width: cWidth + 'px', height: cHeight + 'px' }"
					@touchstart="touchChart"
				></canvas>
				<!-- #endif -->
				<!-- #ifndef MP-ALIPAY -->
				<canvas
					canvas-id="monthlyIncomeChart"
					id="monthlyIncomeChart"
					class="chart-canvas"
					@touchstart="touchChart"
				></canvas>
				<!-- #endif -->
			</view>
		</view>
	</view>
</template>

<script>
	import uCharts from '../../../components/u-charts/u-charts.js'
	import { getMonthlyReportData, formatMoney } from './mock.js'

	let chartInstance = null

	export default {
		data() {
			return {
				reportData: getMonthlyReportData(),
				cWidth: 0,
				cHeight: 0,
				pixelRatio: 1
			}
		},
		onLoad() {
			// #ifdef MP-ALIPAY
			uni.getSystemInfo({
				success: (res) => {
					if (res.pixelRatio > 1) {
						this.pixelRatio = 2
					}
				}
			})
			// #endif
			this.cWidth = uni.upx2px(702)
			this.cHeight = uni.upx2px(520)
		},
		onReady() {
			this.renderChart()
		},
		methods: {
			formatMoney,
			renderChart() {
				const { categories, series } = this.reportData
				chartInstance = new uCharts({
					$this: this,
					canvasId: 'monthlyIncomeChart',
					type: 'column',
					padding: [20, 15, 0, 10],
					legend: {
						show: false
					},
					fontSize: 11,
					background: '#FFFFFF',
					pixelRatio: this.pixelRatio,
					animation: true,
					categories,
					series,
					xAxis: {
						disableGrid: true,
						fontColor: '#999999'
					},
					yAxis: {
						gridType: 'dash',
						dashLength: 4,
						data: [{
							format: (val) => `${Math.round(val)}`
						}]
					},
					dataLabel: true,
					width: this.cWidth * this.pixelRatio,
					height: this.cHeight * this.pixelRatio,
					extra: {
						column: {
							type: 'group',
							width: this.cWidth * this.pixelRatio * 0.35 / categories.length,
							barBorderRadius: [8, 8, 0, 0]
						}
					}
				})
			},
			touchChart(e) {
				if (!chartInstance) return
				chartInstance.showToolTip(e, {
					format: (item, category) => `${category} 收入：¥${Number(item.data).toFixed(2)}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

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
		color: #ff6034;
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

	.chart-wrap {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.chart-canvas {
		width: 702rpx;
		height: 520rpx;
	}
</style>
