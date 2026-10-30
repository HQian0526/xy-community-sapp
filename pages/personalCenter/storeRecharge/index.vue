<template>
	<view class="recharge-page">
		<view class="balance-card">
			<text class="balance-label">当前店铺余额</text>
			<view class="balance-value">
				<text class="currency">¥</text>
				<text class="amount">{{ balanceText }}</text>
			</view>
			<text class="balance-tip">只增加本店余额，和其他门店不互通。每次至少 1 元。</text>
		</view>

		<view class="preset-card">
			<text class="card-title">选择金额</text>
			<view class="preset-grid">
				<view
					v-for="item in presets"
					:key="item"
					class="preset-item"
					:class="{ active: selectedPreset === item && !customMode }"
					@click="selectPreset(item)"
				>
					<view class="preset-inner">
						<text class="preset-amount">{{ item }}</text>
						<text class="preset-unit">元</text>
					</view>
				</view>
				<view class="preset-item" :class="{ active: customMode }" @click="enableCustom">
					<text class="preset-amount custom">自定义</text>
				</view>
			</view>
			<view v-if="customMode" class="custom-row">
				<text class="custom-prefix">¥</text>
				<input
					class="custom-input"
					type="digit"
					:value="customAmount"
					placeholder="请输入不少于1的金额"
					@input="onCustomInput"
				/>
			</view>
		</view>

		<view class="submit-bar">
			<view class="submit-total">
				<text class="submit-label">应付</text>
				<text class="submit-amount">¥{{ payAmountText }}</text>
			</view>
			<view class="submit-btn" :class="{ disabled: !canPay || paying }" @click="handlePay">微信支付</view>
		</view>
	</view>
</template>

<script>
	import {
		requireLogin,
		ensurePhoneBound
	} from '@/common/auth.js'
	import {
		getMallSettlementSummaryApi,
		rechargeStoreBalanceApi,
		mockConfirmStoreBalanceRechargeApi,
		waitStoreBalanceRechargePaid,
		requestWxPayment
	} from '@/common/api/mall/order.js'

	const MIN_AMOUNT = 1

	export default {
		data() {
			return {
				storeId: '',
				balance: 0,
				presets: [100, 200, 500, 1000],
				selectedPreset: 100,
				customMode: false,
				customAmount: '',
				paying: false
			}
		},
		computed: {
			payAmount() {
				if (this.customMode) {
					const n = Number(this.customAmount)
					return Number.isFinite(n) ? n : 0
				}
				return Number(this.selectedPreset || 0)
			},
			canPay() {
				return this.payAmount >= MIN_AMOUNT
			},
			balanceText() {
				return Number(this.balance || 0).toFixed(2)
			},
			payAmountText() {
				return Number(this.payAmount || 0).toFixed(2)
			}
		},
		onLoad(options = {}) {
			this.storeId = options.storeId ? String(options.storeId) : ''
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			const phone = await ensurePhoneBound({ required: true })
			if (!phone?.bound) return
			await this.loadBalance()
		},
		methods: {
			async loadBalance() {
				try {
					const data = await getMallSettlementSummaryApi(
						this.storeId ? { storeId: this.storeId } : {}
					)
					this.balance = Number(data?.pendingAmount || 0)
					if (!this.storeId && data?.storeId) {
						this.storeId = String(data.storeId)
					}
				} catch (error) {
					console.error('加载店铺余额失败', error)
				}
			},
			selectPreset(amount) {
				this.customMode = false
				this.selectedPreset = amount
				this.customAmount = ''
			},
			enableCustom() {
				this.customMode = true
				this.selectedPreset = 0
			},
			onCustomInput(event) {
				this.customAmount = String(event?.detail?.value || '').replace(/[^\d.]/g, '')
			},
			async handlePay() {
				if (this.paying) return
				if (!this.canPay) {
					uni.showToast({ title: '每次储值至少1元', icon: 'none' })
					return
				}
				this.paying = true
				try {
					const payParams = await rechargeStoreBalanceApi({
						storeId: this.storeId,
						amount: this.payAmount
					})
					const rechargeNo = payParams?.orderNo
					if (!rechargeNo) {
						throw new Error('下单失败：未返回单号')
					}
					if (payParams.mock) {
						await mockConfirmStoreBalanceRechargeApi(rechargeNo)
					} else {
						try {
							await requestWxPayment(payParams)
						} catch (err) {
							const msg = err?.errMsg || ''
							if (msg.includes('cancel') || msg.includes('取消')) {
								uni.showToast({ title: '已取消支付', icon: 'none' })
								return
							}
							throw err instanceof Error ? err : new Error(msg || '支付失败')
						}
						const result = await waitStoreBalanceRechargePaid(rechargeNo)
						if (Number(result?.recharge?.payStatus) !== 1) {
							uni.showToast({ title: '支付结果确认中，请稍后查看余额', icon: 'none' })
							return
						}
					}
					uni.showToast({ title: '储值成功', icon: 'success' })
					await this.loadBalance()
					setTimeout(() => uni.navigateBack(), 1200)
				} catch (error) {
					console.error('店铺储值失败', error)
					uni.showToast({ title: error?.message || '储值失败', icon: 'none' })
				} finally {
					this.paying = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.recharge-page {
		min-height: 100vh;
		background-color: #f5f6f8;
		padding: 24rpx 24rpx 180rpx;
		box-sizing: border-box;
	}

	.balance-card,
	.preset-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 32rpx 28rpx;
		margin-bottom: 20rpx;
	}

	.balance-label,
	.card-title {
		font-size: 26rpx;
		color: #888;
	}

	.card-title {
		display: block;
		margin-bottom: 20rpx;
		color: #333;
		font-weight: 600;
	}

	.balance-value {
		display: flex;
		align-items: baseline;
		margin-top: 12rpx;
	}

	.currency {
		font-size: 32rpx;
		font-weight: 600;
		color: #00a896;
	}

	.amount {
		margin-left: 6rpx;
		font-size: 56rpx;
		font-weight: 700;
		color: #00a896;
	}

	.balance-tip {
		display: block;
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;
	}

	.preset-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.preset-item {
		width: calc(33.33% - 12rpx);
		height: 96rpx;
		border-radius: 12rpx;
		border: 2rpx solid #eee;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.preset-item.active {
		border-color: #00a896;
		background: #f3fbf9;
	}

	.preset-inner {
		display: flex;
		align-items: baseline;
	}

	.preset-amount {
		font-size: 32rpx;
		font-weight: 700;
		color: #333;
	}

	.preset-amount.custom {
		font-size: 28rpx;
		font-weight: 600;
	}

	.preset-unit {
		margin-left: 4rpx;
		font-size: 22rpx;
		color: #666;
	}

	.custom-row {
		display: flex;
		align-items: center;
		margin-top: 20rpx;
		padding: 0 20rpx;
		height: 88rpx;
		border-radius: 12rpx;
		background: #f7f7f7;
	}

	.custom-prefix {
		font-size: 32rpx;
		color: #333;
	}

	.custom-input {
		flex: 1;
		margin-left: 12rpx;
		font-size: 30rpx;
	}

	.submit-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background: #fff;
	}

	.submit-label {
		font-size: 24rpx;
		color: #888;
	}

	.submit-amount {
		margin-left: 8rpx;
		font-size: 36rpx;
		font-weight: 700;
		color: #00a896;
	}

	.submit-btn {
		min-width: 220rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 40rpx;
		background: #00a896;
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
	}

	.submit-btn.disabled {
		opacity: 0.5;
	}
</style>
