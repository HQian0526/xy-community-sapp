<template>
	<view class="join-page">
		<scroll-view scroll-y class="poster-scroll">
			<view class="preview-wrap">
				<!-- 图片始终正常布局显示；iOS 上 lazy-load + opacity:0 等 load 容易一直空白 -->
				<image
					v-if="!loadError"
					class="poster-img"
					:src="posterSrc"
					mode="widthFix"
					show-menu-by-longpress
					@load="onImageLoad"
					@error="onImageError"
				/>

				<view v-if="!imageLoaded && !loadError" class="loading-box loading-overlay">
					<up-loading-icon color="#00a896"></up-loading-icon>
					<text class="loading-text">图片加载中...</text>
				</view>

				<view v-if="loadError" class="loading-box error-box" @click="retryLoad">
					<text class="error-text">加载失败，点击重试</text>
				</view>
			</view>
		</scroll-view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleApply">进一步了解</view>
		</view>
	</view>
</template>

<script>
	import { joinPosterUrl } from './mock.js'

	/** iOS 偶发不回调 @load，超时后收起 loading，避免一直挡着海报 */
	const LOAD_FALLBACK_MS = 4000

	export default {
		data() {
			return {
				joinPosterUrl,
				posterSrc: joinPosterUrl,
				imageLoaded: false,
				loadError: false,
				loadFallbackTimer: null
			}
		},
		onReady() {
			this.armLoadFallback()
		},
		onUnload() {
			this.clearLoadFallback()
		},
		methods: {
			armLoadFallback() {
				this.clearLoadFallback()
				this.loadFallbackTimer = setTimeout(() => {
					if (!this.loadError && !this.imageLoaded) {
						this.imageLoaded = true
					}
				}, LOAD_FALLBACK_MS)
			},
			clearLoadFallback() {
				if (this.loadFallbackTimer) {
					clearTimeout(this.loadFallbackTimer)
					this.loadFallbackTimer = null
				}
			},
			onImageLoad() {
				this.clearLoadFallback()
				this.imageLoaded = true
				this.loadError = false
			},
			onImageError() {
				this.clearLoadFallback()
				this.imageLoaded = false
				this.loadError = true
			},
			retryLoad() {
				this.loadError = false
				this.imageLoaded = false
				const separator = this.joinPosterUrl.includes('?') ? '&' : '?'
				this.posterSrc = `${this.joinPosterUrl}${separator}t=${Date.now()}`
				this.armLoadFallback()
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
		min-height: 1200rpx;
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

	.loading-overlay {
		position: absolute;
		left: 24rpx;
		right: 24rpx;
		top: 24rpx;
		z-index: 2;
		pointer-events: none;
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
		vertical-align: top;
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
