<template>
	<view class="apply-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="160rpx">
				<uni-forms-item label="联系方式" name="contact" required>
					<uni-easyinput
						v-model="formData.contact"
						type="number"
						maxlength="11"
						placeholder="请输入11位手机号码"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="绑定区域" name="region" required>
					<uni-easyinput
						v-model="formData.region"
						placeholder="请输入高校名称/社区名称/小区名称"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="详细地址" name="address" required>
					<uni-easyinput
						v-model="formData.address"
						type="textarea"
						autoHeight
						placeholder="请输入详细地址"
						:inputBorder="false"
					/>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="agreement-row" @click="toggleAgreed">
			<view class="agreement-check" :class="{ 'agreement-check--active': agreed }">
				<up-icon v-if="agreed" name="checkmark" size="12" color="#fff"></up-icon>
			</view>
			<text class="agreement-text">我已阅读并同意</text>
			<text class="agreement-link" @click.stop="goAgreement">服务协议内容</text>
		</view>

		<view class="submit-wrap">
			<view
				class="btn-success submit-btn"
				:class="{ 'submit-btn--disabled': !agreed || submitting }"
				@click="handleSubmit"
			>
				提交申请
			</view>
		</view>
	</view>
</template>

<script>
	import { saveJoinApplication } from './mock.js'

	const defaultFormData = () => ({
		contact: '',
		region: '',
		address: ''
	})

	export default {
		data() {
			return {
				formData: defaultFormData(),
				agreed: false,
				submitting: false,
				rules: {
					contact: {
						rules: [
							{ required: true, errorMessage: '请输入联系方式' },
							{ pattern: /^1[3-9]\d{9}$/, errorMessage: '请输入正确的11位手机号码' }
						]
					},
					region: {
						rules: [{ required: true, errorMessage: '请输入绑定区域' }]
					},
					address: {
						rules: [{ required: true, errorMessage: '请输入详细地址' }]
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
					url: '/pages/personalCenter/businessAgreement/index'
				})
			},
			handleSubmit() {
				if (!this.agreed || this.submitting) {
					if (!this.agreed) {
						uni.showToast({
							title: '请先阅读并同意服务协议',
							icon: 'none'
						})
					}
					return
				}

				this.$refs.formRef.validate().then(() => {
					this.submitting = true
					saveJoinApplication({
						...this.formData
					})
					uni.showToast({
						title: '申请已提交，我们将尽快联系您',
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

	.apply-page {
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
