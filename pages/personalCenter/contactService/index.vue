<template>
	<view class="contact-page">
		<view class="preview-wrap">
			<view class="contact-card" :class="{ 'contact-card--show': contentVisible }">
				<text class="slogan">{{ contactInfo.slogan }}</text>
				<text class="desc">{{ contactInfo.desc }}</text>
				<view class="divider"></view>
				<view class="qrcode-wrap">
					<view v-if="!qrVisible" class="qrcode-placeholder">
						<up-loading-icon color="#00a896" size="28"></up-loading-icon>
					</view>
					<view class="qrcode-inner" :class="{ 'qrcode-inner--show': qrVisible }">
						<!-- 原二维码生成器逻辑，改为静态图片展示
						<up-qrcode
							v-if="qrMounted"
							ref="qrCodeRef"
							:val="contactInfo.qrUrl"
							:size="220"
							:margin="0"
							:loadMake="true"
							background="#ffffff"
							foreground="#000000"
							@result="onQrcodeReady"
						/>
						-->
						<image
							v-if="qrMounted"
							class="qrcode-img"
							:src="qrImageUrl"
							mode="aspectFit"
							show-menu-by-longpress
							@load="onQrcodeReady"
							@error="onQrcodeError"
						/>
					</view>
				</view>
				<text v-if="contactInfo.servicePhone" class="phone">填写备注“{{ contactInfo.servicePhone }}”更快通过</text>
			</view>
		</view>

		<view class="hint-text" :class="{ 'hint-text--show': contentVisible }">
			长按二维码可识别添加，或点击下方保存至相册
		</view>

		<view class="submit-wrap">
			<view
				class="btn-success submit-btn"
				:class="{ 'submit-btn--disabled': saving || !qrReady }"
				@click="handleSave"
			>
				{{ saving ? '保存中...' : '保存至相册' }}
			</view>
		</view>
	</view>
</template>

<script>
	import { contactInfo } from './mock.js'

	// 略长于小程序默认页面转场，避免二维码抢在过渡完成前跳出
	const PAGE_ENTER_DELAY = 360
	const QR_FADE_DELAY = 80
	const QR_IMAGE_URL = 'https://file.gzstarfly.com/xy-community/xy-qrcode.png'

	export default {
		data() {
			return {
				contactInfo,
				qrImageUrl: QR_IMAGE_URL,
				contentVisible: false,
				qrMounted: false,
				qrVisible: false,
				qrReady: false,
				saving: false
			}
		},
		onReady() {
			this.enterTimer = setTimeout(() => {
				this.contentVisible = true
				this.qrMounted = true
			}, PAGE_ENTER_DELAY)
		},
		onUnload() {
			clearTimeout(this.enterTimer)
			clearTimeout(this.qrFadeTimer)
		},
		methods: {
			onQrcodeReady() {
				this.qrReady = true
				clearTimeout(this.qrFadeTimer)
				this.qrFadeTimer = setTimeout(() => {
					this.qrVisible = true
				}, QR_FADE_DELAY)
			},
			onQrcodeError() {
				this.qrReady = false
				this.qrVisible = true
				uni.showToast({
					title: '二维码加载失败',
					icon: 'none'
				})
			},
			handleSave() {
				if (this.saving || !this.qrReady) return

				/* 原 up-qrcode 导出保存逻辑
				const qr = this.$refs.qrCodeRef
				if (!qr || typeof qr.toTempFilePath !== 'function') {
					uni.showToast({ title: '二维码未就绪，请稍后重试', icon: 'none' })
					return
				}
				this.saving = true
				qr.toTempFilePath({
					success: (res) => {
						uni.saveImageToPhotosAlbum({ filePath: res.tempFilePath, ... })
					},
					fail: () => { ... }
				})
				*/

				this.saving = true
				uni.downloadFile({
					url: this.qrImageUrl,
					success: (downloadRes) => {
						if (downloadRes.statusCode !== 200 || !downloadRes.tempFilePath) {
							this.saving = false
							uni.showToast({
								title: '图片下载失败',
								icon: 'none'
							})
							return
						}
						uni.saveImageToPhotosAlbum({
							filePath: downloadRes.tempFilePath,
							success: () => {
								uni.showToast({
									title: '已保存至相册',
									icon: 'success'
								})
							},
							fail: (err) => {
								const msg = err?.errMsg || ''
								const needAuth = msg.includes('auth') || msg.includes('authorize') || msg.includes('deny')
								if (needAuth) {
									uni.showModal({
										title: '提示',
										content: '需要相册权限才能保存图片，请在设置中开启',
										confirmText: '去设置',
										success: (modalRes) => {
											if (modalRes.confirm) uni.openSetting()
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
					},
					fail: () => {
						this.saving = false
						uni.showToast({
							title: '图片下载失败',
							icon: 'none'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.contact-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.preview-wrap {
		display: flex;
		justify-content: center;
		padding: 24rpx 0 16rpx;
	}

	.contact-card {
		width: 600rpx;
		box-sizing: border-box;
		padding: 48rpx 40rpx 40rpx;
		border-radius: 24rpx;
		background: linear-gradient(180deg, rgba(0, 168, 150, 0.12) 0%, #ffffff 42%, #ffffff 100%);
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		align-items: center;
		opacity: 0;
		transform: translateY(24rpx);
		transition: opacity 0.35s ease, transform 0.35s ease;
	}

	.contact-card--show {
		opacity: 1;
		transform: translateY(0);
	}

	.slogan {
		font-size: 32rpx;
		font-weight: 600;
		color: $primary;
		text-align: center;
	}

	.desc {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #999;
		text-align: center;
	}

	.divider {
		width: 100%;
		height: 2rpx;
		margin: 32rpx 0;
		background-color: #f0f0f0;
	}

	.qrcode-wrap {
		position: relative;
		width: 220px;
		height: 220px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		overflow: hidden;
	}

	.qrcode-placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		z-index: 1;
	}

	.qrcode-inner {
		width: 220px;
		height: 220px;
		opacity: 0;
		transition: opacity 0.28s ease;
	}

	.qrcode-inner--show {
		opacity: 1;
	}

	.qrcode-img {
		width: 220px;
		height: 220px;
		display: block;
	}

	.phone {
		margin-top: 28rpx;
		font-size: 26rpx;
		color: #666;
	}

	.hint-text {
		text-align: center;
		font-size: 26rpx;
		color: #999;
		padding-bottom: 24rpx;
		opacity: 0;
		transition: opacity 0.35s ease 0.08s;
	}

	.hint-text--show {
		opacity: 1;
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
