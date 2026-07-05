<template>
	<view class="transfer-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="180rpx">
				<uni-forms-item label="姓名" name="name" required>
					<uni-easyinput
						v-model="formData.name"
						placeholder="请输入姓名"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="手机号" name="contact" required>
					<uni-easyinput
						v-model="formData.contact"
						type="number"
						maxlength="11"
						placeholder="请输入11位手机号码"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="绑定区域">
					<view class="readonly-field">
						<text class="readonly-value">{{ bindRegion }}</text>
						<text class="readonly-tip">店铺转让无法更改经营区域</text>
					</view>
				</uni-forms-item>

				<uni-forms-item label="转让费" name="transferFee" required>
					<view class="fee-input">
						<uni-easyinput
							v-model="formData.transferFee"
							type="digit"
							placeholder="请输入转让费，最低800元"
							:inputBorder="false"
							@blur="formatTransferFee"
							@input="handleTransferFeeInput"
						/>
						<text class="fee-unit">元</text>
					</view>
				</uni-forms-item>

				<uni-forms-item label="过户手续费">
					<view class="fee-value">
						<text class="fee-amount">¥{{ handlingFee }}元</text>
						<text class="readonly-tip">平台收取，用于平台审核、资料变更及过户服务</text>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="agreement-row" @click="toggleAgreed">
			<view class="agreement-check" :class="{ 'agreement-check--active': agreed }">
				<up-icon v-if="agreed" name="checkmark" size="12" color="#fff"></up-icon>
			</view>
			<text class="agreement-text">我已阅读并同意</text>
			<text class="agreement-link" @click.stop="goAgreement">平台店铺转让规则</text>
		</view>

		<view class="submit-wrap">
			<view
				class="btn-success submit-btn"
				:class="{ 'submit-btn--disabled': !agreed || submitting }"
				@click="handleSubmit"
			>
				确认转让
			</view>
		</view>
	</view>
</template>

<script>
	import {
		saveStoreTransfer,
		MIN_TRANSFER_FEE,
		TRANSFER_HANDLING_FEE,
		BIND_REGION
	} from './mock.js'

	const defaultFormData = () => ({
		name: '',
		contact: '',
		transferFee: ''
	})

	export default {
		data() {
			return {
				formData: defaultFormData(),
				bindRegion: BIND_REGION,
				handlingFee: TRANSFER_HANDLING_FEE,
				minTransferFee: MIN_TRANSFER_FEE,
				agreed: false,
				submitting: false,
				rules: {
					name: {
						rules: [{ required: true, errorMessage: '请输入姓名' }]
					},
					contact: {
						rules: [
							{ required: true, errorMessage: '请输入手机号' },
							{ pattern: /^1[3-9]\d{9}$/, errorMessage: '请输入正确的11位手机号码' }
						]
					},
					transferFee: {
						rules: [
							{ required: true, errorMessage: '请输入转让费' },
							{
								validateFunction: (rule, value, data, callback) => {
									if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
										callback('转让费格式不正确，最多保留两位小数')
										return
									}
									if (parseFloat(value) < MIN_TRANSFER_FEE) {
										callback(`转让费不能低于 ${MIN_TRANSFER_FEE} 元`)
										return
									}
									callback()
								}
							}
						]
					}
				}
			}
		},
		methods: {
			toggleAgreed() {
				this.agreed = !this.agreed
			},
			goAgreement() {
				uni.navigateTo({
					url: '/pages/personalCenter/transferAgreement/index'
				})
			},
			handleTransferFeeInput(value) {
				let val = String(value || '')
				val = val.replace(/[^\d.]/g, '')
				const parts = val.split('.')
				if (parts.length > 2) {
					val = parts[0] + '.' + parts.slice(1).join('')
				}
				if (parts.length === 2 && parts[1].length > 2) {
					val = parts[0] + '.' + parts[1].slice(0, 2)
				}
				this.formData.transferFee = val
			},
			formatTransferFee() {
				if (!this.formData.transferFee) return
				const num = parseFloat(this.formData.transferFee)
				if (!isNaN(num) && num > 0) {
					this.formData.transferFee = num.toFixed(2)
				}
			},
			handleSubmit() {
				if (!this.agreed || this.submitting) {
					if (!this.agreed) {
						uni.showToast({
							title: '请先阅读并同意转让规则',
							icon: 'none'
						})
					}
					return
				}

				this.formatTransferFee()
				this.$refs.formRef.validate().then(() => {
					this.submitting = true
					saveStoreTransfer({
						...this.formData,
						region: this.bindRegion,
						handlingFee: this.handlingFee
					})
					uni.showToast({
						title: '转让申请已提交',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1200)
				}).catch(() => {}).finally(() => {
					this.submitting = false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.transfer-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 8rpx 24rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.readonly-field {
		min-height: 72rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8rpx;
		padding: 8rpx 0;
	}

	.readonly-value {
		font-size: 28rpx;
		color: #333;
	}

	.readonly-tip {
		font-size: 22rpx;
		color: #999;
	}

	.fee-input {
		display: flex;
		align-items: center;
	}

	.fee-unit {
		flex-shrink: 0;
		margin-left: 8rpx;
		font-size: 28rpx;
		color: #666;
	}

	.fee-value {
		min-height: 72rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.fee-amount {
		font-size: 32rpx;
		font-weight: 600;
		color: $primary;
	}

	.agreement-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 32rpx;
		padding: 0 8rpx;
	}

	.agreement-check {
		width: 32rpx;
		height: 32rpx;
		border-radius: 6rpx;
		border: 2rpx solid #c8c9cc;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12rpx;
		flex-shrink: 0;
		box-sizing: border-box;

		&--active {
			background-color: $primary;
			border-color: $primary;
		}
	}

	.agreement-text {
		font-size: 26rpx;
		color: #666;
	}

	.agreement-link {
		font-size: 26rpx;
		color: $primary;
		text-decoration: underline;
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
