<template>
	<view class="share-page">
		<view class="preview-wrap">
			<image
				v-if="posterPath"
				class="poster-preview"
				:src="posterPath"
				mode="widthFix"
				show-menu-by-longpress
			/>
			<view v-else class="loading-box">
				<up-loading-icon color="#00a896"></up-loading-icon>
				<text class="loading-text">海报生成中...</text>
			</view>
		</view>

		<up-poster ref="posterRef" :json="posterJson" />

		<view class="submit-wrap">
			<view
				class="btn-success submit-btn"
				:class="{ 'submit-btn--disabled': !posterPath || saving }"
				@click="handleSave"
			>
				保存至相册
			</view>
		</view>
	</view>
</template>

<script>
	import { shareInfo, getPosterJson } from './mock.js'

	export default {
		data() {
			return {
				shareInfo,
				posterJson: getPosterJson(shareInfo),
				posterPath: '',
				saving: false
			}
		},
		onReady() {
			this.generatePoster()
		},
		methods: {
			async generatePoster() {
				try {
					const res = await this.$refs.posterRef.exportImage()
					this.posterPath = res.path
				} catch (e) {
					uni.showToast({
						title: '海报生成失败',
						icon: 'none'
					})
				}
			},
			handleSave() {
				if (!this.posterPath || this.saving) return

				this.saving = true
				uni.saveImageToPhotosAlbum({
					filePath: this.posterPath,
					success: () => {
						uni.showToast({
							title: '已保存至相册',
							icon: 'success'
						})
					},
					fail: (err) => {
						const needAuth = err.errMsg && (
							err.errMsg.includes('auth') ||
							err.errMsg.includes('authorize') ||
							err.errMsg.includes('deny')
						)
						if (needAuth) {
							uni.showModal({
								title: '提示',
								content: '需要相册权限才能保存图片，请在设置中开启',
								confirmText: '去设置',
								success: (res) => {
									if (res.confirm) {
										uni.openSetting()
									}
								}
							})
							return
						}
						uni.showToast({
							title: '保存失败',
							icon: 'none'
						})
					},
					complete: () => {
						this.saving = false
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.share-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.preview-wrap {
		display: flex;
		justify-content: center;
		padding: 24rpx 0 48rpx;
	}

	.poster-preview {
		width: 600rpx;
		border-radius: 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}

	.loading-box {
		width: 600rpx;
		height: 1000rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		border-radius: 16rpx;
	}

	.loading-text {
		margin-top: 24rpx;
		font-size: 26rpx;
		color: #999;
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

	.submit-btn--disabled {
		opacity: 0.6;
	}
</style>
