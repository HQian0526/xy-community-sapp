<template>
	<view class="agreement-page">
		<scroll-view class="agreement-scroll" scroll-y>
			<view class="agreement-card">
				<view
					v-for="(section, index) in agreementInfo.sections"
					:key="index"
					class="section-item"
				>
					<text class="section-title">{{ section.title }}</text>
					<text class="section-content">{{ section.content }}</text>
				</view>
			</view>
		</scroll-view>
	</view>    
</template>

<script>
	import { agreementInfo } from './mock.js'

	export default {
		data() {
			return {
				agreementInfo
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.agreement-page {
		height: 100vh;
		background-color: #f5f5f5;
		box-sizing: border-box;
	}

	.agreement-scroll {
		height: 100%;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.agreement-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx 28rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.section-item {
		margin-bottom: 36rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
		padding-left: 16rpx;
		border-left: 6rpx solid $primary;
	}

	.section-content {
		display: block;
		font-size: 28rpx;
		color: #666;
		line-height: 1.8;
		white-space: pre-wrap;
	}
</style>
