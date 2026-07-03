<template>
	<view class="step-page">
		<view class="order-card">
			<view class="order-row">
				<text class="order-label">工单编码</text>
				<text class="order-value">{{ orderInfo.orderCode }}</text>
			</view>
			<view class="order-row">
				<text class="order-label">任务名称</text>
				<text class="order-value">{{ orderInfo.companyName }}</text>
			</view>
			<view class="order-row order-row-last">
				<text class="order-label">当前状态</text>
				<text class="status-tag" :class="'status-' + orderInfo.statusType">{{ orderInfo.status }}</text>
			</view>
		</view>

		<view class="steps-card">
			<text class="section-title">进度详情</text>
			<u-steps
				:current="current"
				direction="column"
				dot
				activeColor="#00a896"
				inactiveColor="#c8c9cc"
			>
				<u-steps-item
					v-for="(step, index) in steps"
					:key="index"
					:title="step.title"
					:desc="step.desc"
				></u-steps-item>
			</u-steps>
		</view>
	</view>
</template>

<script>
	import { getOrderProgress } from './mock.js'

	export default {
		data() {
			return {
				orderInfo: {},
				current: 0,
				steps: []
			}
		},
		onLoad(options) {
			this.loadProgress(options.id)
		},
		methods: {
			loadProgress(id) {
				const { order, current, steps } = getOrderProgress(id)
				this.orderInfo = order
				this.current = current
				this.steps = steps
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.step-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.order-card,
	.steps-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.order-row {
		display: flex;
		align-items: flex-start;
		margin-bottom: 20rpx;
		font-size: 28rpx;
		line-height: 1.5;
	}

	.order-row-last {
		margin-bottom: 0;
	}

	.order-label {
		flex-shrink: 0;
		width: 160rpx;
		color: #999;
	}

	.order-value {
		flex: 1;
		color: #333;
		word-break: break-all;
	}

	.status-tag {
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		border-width: 1rpx;
		border-style: solid;
	}

	.status-dispatched {
		color: $primary;
		border-color: $primary;
	}

	.status-dispatching {
		color: #007aff;
		border-color: #007aff;
	}

	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 32rpx;
		padding-left: 16rpx;
		border-left: 6rpx solid $primary;
	}
</style>
