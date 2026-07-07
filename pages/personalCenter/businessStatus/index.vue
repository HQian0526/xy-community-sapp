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
				:class="isOpen ? 'btn-gray-solid' : 'btn-success'"
				@click="handleToggle"
			>
				{{ actionText }}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		STATUS_OPEN,
		STATUS_CLOSED,
		getBusinessStatus,
		setBusinessStatus
	} from './mock.js'

	export default {
		data() {
			return {
				currentStatus: STATUS_OPEN
			}
		},
		computed: {
			isOpen() {
				return this.currentStatus === STATUS_OPEN
			},
			actionText() {
				return this.isOpen ? '暂停营业' : '开始营业'
			},
			statusTip() {
				return this.isOpen
					? '营业中，用户可正常下单'
					: '已暂停营业，用户暂时无法下单'
			}
		},
		onLoad() {
			this.loadStatus()
		},
		methods: {
			loadStatus() {
				this.currentStatus = getBusinessStatus()
			},
			handleToggle() {
				const nextStatus = this.isOpen ? STATUS_CLOSED : STATUS_OPEN
				const content = this.isOpen
					? '确定要暂停营业吗？暂停后用户将无法下单'
					: '确定要开始营业吗？'

				uni.showModal({
					title: '提示',
					content,
					success: (res) => {
						if (!res.confirm) return
						setBusinessStatus(nextStatus)
						this.currentStatus = nextStatus
						uni.showToast({
							title: this.isOpen ? '已开始营业' : '已暂停营业',
							icon: 'success'
						})
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

	.btn-gray-solid {
		color: #fff;
		background-color: #999;
	}
</style>
