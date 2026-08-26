<template>
	<u-popup :show="visible" mode="center" round="16" :closeOnClickOverlay="closable" @close="handleClose">
		<view class="bind-phone-popup">
			<text class="title">绑定手机号</text>
			<text class="desc">授权后将自动合并后台管理端账号，便于下单与联系</text>

			<!-- #ifdef MP-WEIXIN -->
			<button
				class="bind-btn"
				open-type="getPhoneNumber"
				:loading="loading"
				:disabled="loading"
				@getphonenumber="onGetPhoneNumber"
			>微信手机号一键绑定</button>
			<!-- #endif -->

			<!-- #ifndef MP-WEIXIN -->
			<button class="bind-btn" :loading="loading" disabled>请在微信小程序中授权</button>
			<!-- #endif -->

			<text v-if="closable" class="skip" @click="handleClose">稍后再说</text>
		</view>
	</u-popup>
</template>

<script>
	import {
		registerBindPhoneUI,
		unregisterBindPhoneUI,
		isNeedBindPhone,
		bindPhoneByCode
	} from '@/common/bindPhoneUi.js'

	export default {
		name: 'BindPhonePopup',
		props: {
			/** 是否允许关闭 / 稍后再说 */
			closable: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				visible: false,
				loading: false,
				resolver: null
			}
		},
		mounted() {
			this.uiHandlers = {
				show: this.open
			}
			this.activate()
		},
		beforeDestroy() {
			this.deactivate()
		},
		// #ifdef VUE3
		beforeUnmount() {
			this.deactivate()
		},
		// #endif
		methods: {
			activate() {
				registerBindPhoneUI(this.uiHandlers)
			},
			deactivate() {
				unregisterBindPhoneUI(this.uiHandlers)
			},
			open() {
				if (!isNeedBindPhone()) {
					return Promise.resolve({
						skipped: false,
						userInfo: null
					})
				}
				return new Promise((resolve) => {
					this.resolver = resolve
					this.visible = true
				})
			},
			finish(result) {
				this.visible = false
				this.loading = false
				if (this.resolver) {
					this.resolver(result)
					this.resolver = null
				}
			},
			handleClose() {
				if (!this.closable || this.loading) return
				this.finish({
					skipped: true
				})
			},
			async onGetPhoneNumber(e) {
				const detail = e?.detail || {}
				const errMsg = detail.errMsg || ''
				if (errMsg && errMsg.indexOf('ok') === -1) {
					uni.showToast({
						title: '需要授权手机号才能合并账号',
						icon: 'none'
					})
					return
				}
				if (!detail.code) {
					uni.showToast({
						title: '未获取到手机号授权',
						icon: 'none'
					})
					return
				}

				this.loading = true
				try {
					const result = await bindPhoneByCode(detail.code)
					uni.showToast({
						title: result.merged ? '账号已合并' : '手机号绑定成功',
						icon: 'success'
					})
					this.finish({
						skipped: false,
						...result
					})
				} catch (error) {
					console.error('绑定手机号失败', error)
					this.loading = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bind-phone-popup {
		width: 560rpx;
		padding: 48rpx 40rpx 36rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.title {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
	}

	.desc {
		font-size: 26rpx;
		color: #888;
		line-height: 1.5;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.bind-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		background-color: #00a896;
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
		border: none;
		padding: 0;
		margin: 0;

		&::after {
			border: none;
		}

		&[disabled] {
			opacity: 0.7;
		}
	}

	.skip {
		margin-top: 28rpx;
		font-size: 26rpx;
		color: #999;
		padding: 8rpx 16rpx;
	}
</style>
