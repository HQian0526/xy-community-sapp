<template>
	<view class="status-page">
		<view class="status-card">
			<text class="status-label">当前状态</text>
			<view class="status-value-wrap">
				<view class="status-dot" :class="isOpen ? 'status-dot--open' : 'status-dot--closed'"></view>
				<text class="status-value" :class="isOpen ? 'status-value--open' : 'status-value--closed'">
					{{ currentStatus }}
				</text>
			</view>
			<text class="status-tip">{{ statusTip }}</text>
		</view>

		<view class="submit-wrap">
			<view
				class="submit-btn"
				:class="[isOpen ? 'btn-gray-solid' : 'btn-success', { 'is-loading': submitting }]"
				@click="handleToggle"
			>
				{{ submitting ? '提交中...' : actionText }}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		STATUS_OPEN,
		STATUS_CLOSED,
		STATUS_CODE_OPEN,
		STATUS_CODE_CLOSED,
		statusCodeToLabel
	} from './mock.js'
	import {
		requireLogin,
		getUserInfo
	} from '@/common/auth.js'
	import {
		getUserInfoApi
	} from '@/common/api/personalCenter/user.js'
	import {
		getStoreListApi,
		updateStoreApi,
		STORE_STATUS_CLOSED
	} from '@/common/api/personalCenter/store.js'

	export default {
		data() {
			return {
				currentStatus: STATUS_OPEN,
				storeId: null,
				storeRecordId: null,
				submitting: false
			}
		},
		computed: {
			isOpen() {
				return this.currentStatus === STATUS_OPEN
			},
			actionText() {
				return this.isOpen ? '打烊' : '开始营业'
			},
			statusTip() {
				return this.isOpen
					? '营业中，用户可正常下单'
					: '已打烊，用户暂时无法下单'
			}
		},
		async onShow() {
			await this.loadStatus()
		},
		methods: {
			async loadStatus() {
				const ok = await requireLogin({
					force: true
				})
				if (!ok) return

				try {
					let userId = getUserInfo()?.id
					if (!userId) {
						const user = await getUserInfoApi()
						userId = user?.id
					}
					if (!userId) {
						uni.showToast({
							title: '未获取到用户信息',
							icon: 'none'
						})
						return
					}

					const data = await getStoreListApi({
						userId
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const store = list[0]
					if (!store) {
						uni.showToast({
							title: '未找到店铺信息',
							icon: 'none'
						})
						return
					}

					this.storeRecordId = store.id
					this.storeId = store.storeId
					this.currentStatus = statusCodeToLabel(store.storeStatus)
				} catch (error) {
					console.error('获取营业状态失败', error)
				}
			},
			handleToggle() {
				if (this.submitting) return
				if (!this.storeRecordId) {
					uni.showToast({
						title: '未找到店铺信息',
						icon: 'none'
					})
					return
				}

				const nextCode = this.isOpen ? STATUS_CODE_CLOSED : STATUS_CODE_OPEN
				const nextLabel = nextCode === STORE_STATUS_CLOSED ? STATUS_CLOSED : STATUS_OPEN
				const content = this.isOpen
					? '确定要打烊吗？打烊后用户将无法下单'
					: '确定要开始营业吗？'

				uni.showModal({
					title: '提示',
					content,
					success: async (res) => {
						if (!res.confirm) return
						this.submitting = true
						try {
							await updateStoreApi({
								id: this.storeRecordId,
								storeStatus: nextCode
							})
							this.currentStatus = nextLabel
							uni.showToast({
								title: this.isOpen ? '已开始营业' : '已打烊',
								icon: 'success'
							})
						} catch (error) {
							console.error('更新营业状态失败', error)
						} finally {
							this.submitting = false
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.status-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.status-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 48rpx 32rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.status-label {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 32rpx;
	}

	.status-value-wrap {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.status-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
	}

	.status-dot--open {
		background-color: $primary;
	}

	.status-dot--closed {
		background-color: #999;
	}

	.status-value {
		font-size: 40rpx;
		font-weight: 700;
	}

	.status-value--open {
		color: $primary;
	}

	.status-value--closed {
		color: #666;
	}

	.status-tip {
		font-size: 26rpx;
		color: #999;
		text-align: center;
		line-height: 1.5;
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
		text-align: center;
		border-radius: 44rpx;
	}

	.submit-btn.is-loading {
		opacity: 0.7;
	}

	.btn-gray-solid {
		color: #fff;
		background-color: #999;
	}
</style>
