<template>
	<view class="join-page">
		<scroll-view scroll-y class="poster-scroll">
			<view class="preview-wrap">
				<view v-if="!imageLoaded && !loadError" class="loading-box">
					<up-loading-icon color="#00a896"></up-loading-icon>
					<text class="loading-text">图片加载中...</text>
				</view>

				<view v-if="loadError" class="loading-box error-box" @click="retryLoad">
					<text class="error-text">加载失败，点击重试</text>
				</view>

				<image
					v-if="!loadError"
					class="poster-img"
					:class="{ 'poster-img--visible': imageLoaded }"
					:src="posterSrc"
					mode="widthFix"
					lazy-load
					show-menu-by-longpress
					@load="onImageLoad"
					@error="onImageError"
				/>
			</view>
		</scroll-view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleApply">申请入驻</view>
		</view>
	</view>
</template>

<script>
	import { joinPosterUrl } from './mock.js'

	export default {
		data() {
			return {
				joinPosterUrl,
				posterSrc: joinPosterUrl,
				imageLoaded: false,
				loadError: false
			}
		},
		methods: {
			onImageLoad() {
				this.imageLoaded = true
				this.loadError = false
			},
			onImageError() {
				this.imageLoaded = false
				this.loadError = true
			},
			retryLoad() {
				this.loadError = false
				this.imageLoaded = false
				const separator = this.joinPosterUrl.includes('?') ? '&' : '?'
				this.posterSrc = `${this.joinPosterUrl}${separator}t=${Date.now()}`
			},
			handleApply() {
				uni.navigateTo({
					url: '/pages/join/apply/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.join-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
	}

	.poster-scroll {
		flex: 1;
		height: 0;
	}

	.preview-wrap {
		position: relative;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.loading-box {
		width: 100%;
		min-height: 1200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
	}

	.error-box {
		min-height: 400rpx;
	}

	.loading-text,
	.error-text {
		margin-top: 24rpx;
		font-size: 26rpx;
		color: #999;
	}

	.error-text {
		color: #00a896;
	}

	.poster-img {
		width: 100%;
		border-radius: 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
		display: block;
		opacity: 0;
		transition: opacity 0.35s ease-in-out;

		&--visible {
			opacity: 1;
		}
	}

	.submit-wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 24rpx 48rpx calc(24rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.submit-btn {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: 600;
	}
</style>
