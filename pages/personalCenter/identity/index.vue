<template>
	<view class="identity-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="220rpx">
				<uni-forms-item label="真实姓名" name="realName" required>
					<uni-easyinput
						v-model="formData.realName"
						placeholder="请输入真实姓名"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="身份证号" name="idCardNo" required>
					<uni-easyinput
						v-model="formData.idCardNo"
						placeholder="请输入身份证号码"
						maxlength="18"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="身份证正面" name="idCardFront" required>
					<view class="id-upload" @click="chooseImage('idCardFront')">
						<image
							v-if="formData.idCardFront"
							class="id-img"
							:src="formData.idCardFront"
							mode="aspectFill"
						/>
						<view v-else class="id-placeholder">
							<up-icon name="camera-fill" size="32" color="#00a896"></up-icon>
							<text class="id-tip">上传人像面</text>
						</view>
					</view>
				</uni-forms-item>

				<uni-forms-item label="身份证反面" name="idCardBack" required>
					<view class="id-upload" @click="chooseImage('idCardBack')">
						<image
							v-if="formData.idCardBack"
							class="id-img"
							:src="formData.idCardBack"
							mode="aspectFill"
						/>
						<view v-else class="id-placeholder">
							<up-icon name="camera-fill" size="32" color="#00a896"></up-icon>
							<text class="id-tip">上传国徽面</text>
						</view>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="tips-card">
			<text class="tips-title">上传须知</text>
			<text class="tips-text">1. 请上传本人有效二代身份证原件照片</text>
			<text class="tips-text">2. 确保证件边框完整、文字清晰、无反光遮挡</text>
			<text class="tips-text">3. 您的信息仅用于实名认证，我们将严格保密</text>
			<text class="tips-text">4. 提交审批后将于48小时内完成审核</text>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleSubmit">提交认证</view>
		</view>
	</view>
</template>

<script>
	const defaultFormData = () => ({
		realName: '',
		idCardNo: '',
		idCardFront: '',
		idCardBack: ''
	})

	const ID_CARD_PATTERN = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

	export default {
		data() {
			return {
				formData: defaultFormData(),
				rules: {
					realName: {
						rules: [{ required: true, errorMessage: '请输入真实姓名' }]
					},
					idCardNo: {
						rules: [
							{ required: true, errorMessage: '请输入身份证号' },
							{ pattern: ID_CARD_PATTERN, errorMessage: '身份证号格式不正确' }
						]
					},
					idCardFront: {
						rules: [{ required: true, errorMessage: '请上传身份证正面' }]
					},
					idCardBack: {
						rules: [{ required: true, errorMessage: '请上传身份证反面' }]
					}
				}
			}
		},
		onLoad() {
			this.loadFormData()
		},
		methods: {
			loadFormData() {
				const cached = uni.getStorageSync('identityInfo')
				if (cached) {
					this.formData = { ...defaultFormData(), ...cached }
				}
			},
			chooseImage(field) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.formData[field] = res.tempFilePaths[0]
					}
				})
			},
			handleSubmit() {
				this.$refs.formRef.validate().then(() => {
					uni.setStorageSync('identityInfo', this.formData)
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1200)
				}).catch(() => {})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.identity-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 8rpx 24rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.id-upload {
		width: 100%;
	}

	.id-img,
	.id-placeholder {
		width: 100%;
		height: 320rpx;
		border-radius: 12rpx;
	}

	.id-img {
		background-color: #f5f5f5;
	}

	.id-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 168, 150, 0.08);
		border: 2rpx dashed $primary;
	}

	.id-tip {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: $primary;
	}

	.tips-card {
		margin-top: 24rpx;
		padding: 24rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.tips-title {
		display: block;
		font-size: 26rpx;
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
		margin-top: 48rpx;
		padding: 0 24rpx;
	}

	.submit-btn {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: 600;
	}
</style>
