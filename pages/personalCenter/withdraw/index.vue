<template>
	<view class="withdraw-page">
		<view class="balance-card">
			<text class="balance-label">可提现金额（元）</text>
			<view class="balance-value">
				<text class="currency">¥</text>
				<text class="amount">{{ formatMoney(balance) }}</text>
			</view>
		</view>

		<view class="form-card">
			<view class="amount-section">
				<text class="section-label">提现金额</text>
				<view class="amount-input-wrap">
					<text class="amount-symbol">¥</text>
					<input
						class="amount-input"
						type="digit"
						v-model="formData.amount"
						:placeholder="`最低提现 ${withdrawInfo.minAmount} 元`"
						placeholder-class="amount-placeholder"
						@input="handleAmountInput"
						@blur="handleAmountBlur"
					/>
				</view>
				<text v-if="amountError" class="amount-error">{{ amountError }}</text>
				<view class="amount-extra">
					<text
						class="withdraw-all"
						:class="{ 'withdraw-all--disabled': balance < withdrawInfo.minAmount }"
						@click="withdrawAll"
					>
						全部提现
					</text>
				</view>
			</view>

			<view class="divider"></view>

			<view class="info-row">
				<text class="info-label">提现方式</text>
				<text class="info-value">{{ withdrawInfo.withdrawMethod }}</text>
			</view>
		</view>

		<view class="tips-card">
			<text class="tips-title">提现说明</text>
			<text class="tips-text">1. 最低提现金额为 {{ withdrawInfo.minAmount }} 元</text>
			<text class="tips-text">2. {{ withdrawInfo.arrivalTip }}</text>
			<text class="tips-text">3. 提现金额将转入您的微信零钱账户</text>
		</view>

		<view class="submit-wrap">
			<view
				class="btn-success submit-btn"
				:class="{ 'submit-btn--disabled': !canSubmit }"
				@click="handleSubmit"
			>
				确认提现
			</view>
		</view>
	</view>
</template>

<script>
	import {
		withdrawInfo,
		MIN_WITHDRAW,
		getWalletBalance,
		setWalletBalance,
		formatMoney,
		validateWithdrawAmount
	} from './mock.js'

	export default {
		data() {
			return {
				balance: 0,
				withdrawInfo,
				formData: {
					amount: ''
				},
				amountError: '',
				touched: false
			}
		},
		computed: {
			canSubmit() {
				return validateWithdrawAmount(this.formData.amount, this.balance).valid
			}
		},
		onShow() {
			this.loadBalance()
		},
		methods: {
			formatMoney,
			loadBalance() {
				this.balance = getWalletBalance()
			},
			handleAmountInput(e) {
				let val = String(e.detail.value || '')
				val = val.replace(/[^\d.]/g, '')
				const parts = val.split('.')
				if (parts.length > 2) {
					val = parts[0] + '.' + parts.slice(1).join('')
				}
				if (parts.length === 2 && parts[1].length > 2) {
					val = parts[0] + '.' + parts[1].slice(0, 2)
				}
				this.formData.amount = val
				this.touched = true
				this.updateAmountError()
			},
			handleAmountBlur() {
				this.touched = true
				if (!this.formData.amount) {
					this.updateAmountError()
					return
				}
				const num = parseFloat(this.formData.amount)
				if (!isNaN(num) && num > 0) {
					this.formData.amount = num.toFixed(2)
				}
				this.updateAmountError(true)
			},
			updateAmountError(showToast = false) {
				if (!this.touched && !this.formData.amount) {
					this.amountError = ''
					return
				}
				const { valid, message } = validateWithdrawAmount(this.formData.amount, this.balance)
				this.amountError = valid ? '' : message
				if (showToast && !valid && message) {
					uni.showToast({ title: message, icon: 'none' })
				}
			},
			withdrawAll() {
				if (this.balance < MIN_WITHDRAW) {
					uni.showToast({
						title: `可提现余额不足 ${MIN_WITHDRAW} 元`,
						icon: 'none'
					})
					return
				}
				this.formData.amount = formatMoney(this.balance)
				this.touched = true
				this.updateAmountError()
			},
			validateAmount(showToast = true) {
				const result = validateWithdrawAmount(this.formData.amount, this.balance)
				this.amountError = result.valid ? '' : result.message
				if (showToast && !result.valid) {
					uni.showToast({ title: result.message, icon: 'none' })
				}
				return result.valid
			},
			handleSubmit() {
				this.touched = true
				if (!this.validateAmount()) return

				const amount = parseFloat(this.formData.amount)
				this.formData.amount = formatMoney(amount)

				uni.showModal({
					title: '确认提现',
					content: `确定提现 ¥${formatMoney(amount)} 到${this.withdrawInfo.withdrawMethod}吗？`,
					success: (res) => {
						if (!res.confirm) return
						const nextBalance = Math.max(0, this.balance - amount)
						setWalletBalance(nextBalance)
						this.balance = nextBalance
						this.formData.amount = ''
						this.amountError = ''
						this.touched = false
						uni.showToast({
							title: '提现申请已提交',
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

	.withdraw-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.balance-card {
		background: linear-gradient(135deg, $primary 0%, #33b9ab 100%);
		border-radius: 16rpx;
		padding: 40rpx 32rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 168, 150, 0.25);
	}

	.balance-label {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
	}

	.balance-value {
		display: flex;
		align-items: baseline;
		margin-top: 16rpx;
	}

	.currency {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
		margin-right: 8rpx;
	}

	.amount {
		font-size: 56rpx;
		font-weight: 700;
		color: #fff;
		line-height: 1;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.amount-section {
		padding-bottom: 8rpx;
	}

	.section-label {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.amount-input-wrap {
		display: flex;
		align-items: center;
		margin-top: 24rpx;
		padding-bottom: 16rpx;
		border-bottom: 1rpx solid #eee;
	}

	.amount-symbol {
		font-size: 48rpx;
		font-weight: 600;
		color: #333;
		margin-right: 16rpx;
	}

	.amount-input {
		flex: 1;
		font-size: 48rpx;
		font-weight: 600;
		color: #333;
		height: 72rpx;
	}

	.amount-placeholder {
		font-size: 32rpx;
		font-weight: 400;
		color: #ccc;
	}

	.amount-extra {
		display: flex;
		justify-content: flex-end;
		margin-top: 16rpx;
	}

	.amount-error {
		display: block;
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #e64340;
		line-height: 1.4;
	}

	.withdraw-all {
		font-size: 26rpx;
		color: $primary;
	}

	.withdraw-all--disabled {
		color: #ccc;
	}

	.divider {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 24rpx 0;
	}

	.info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 28rpx;
	}

	.info-label {
		color: #999;
	}

	.info-value {
		color: #333;
	}

	.tips-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.tips-title {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
	}

	.tips-text {
		display: block;
		font-size: 24rpx;
		color: #999;
		line-height: 1.8;
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
		opacity: 0.5;
	}
</style>
