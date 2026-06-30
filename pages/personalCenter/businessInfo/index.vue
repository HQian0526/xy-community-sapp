<template>
	<view class="business-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="220rpx">
				<uni-forms-item label="法人姓名" name="legalName" required>
					<uni-easyinput
						v-model="formData.legalName"
						placeholder="请输入法人姓名"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="法人身份证号" name="legalIdCardNo" required>
					<uni-easyinput
						v-model="formData.legalIdCardNo"
						placeholder="请输入法人身份证号码"
						maxlength="18"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="营业执照" name="businessLicense" required>
					<view class="file-upload" @click="chooseImage('businessLicense')">
						<image
							v-if="formData.businessLicense"
							class="file-img"
							:src="formData.businessLicense"
							mode="aspectFill"
						/>
						<view v-else class="file-placeholder">
							<up-icon name="camera-fill" size="32" color="#00a896"></up-icon>
							<text class="file-tip">上传营业执照</text>
						</view>
					</view>
				</uni-forms-item>

				<uni-forms-item label="补充资料" name="extraFiles">
					<view class="extra-list">
						<view
							v-for="(file, index) in formData.extraFiles"
							:key="index"
							class="extra-item"
						>
							<image class="extra-img" :src="file" mode="aspectFill" />
							<view class="extra-remove" @click.stop="removeExtraFile(index)">
								<up-icon name="close" size="12" color="#fff"></up-icon>
							</view>
						</view>
						<view
							v-if="formData.extraFiles.length < 6"
							class="extra-add"
							@click="chooseExtraFiles"
						>
							<up-icon name="plus" size="28" color="#00a896"></up-icon>
							<text class="file-tip">添加图片</text>
						</view>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="tips-card">
			<text class="tips-title">审核说明</text>
			<text class="tips-text">1. 请上传清晰、完整的营业执照原件照片</text>
			<text class="tips-text">2. 法人信息须与营业执照登记信息一致</text>
			<text class="tips-text">3. 补充资料可上传门店照片、经营许可证等（选填）</text>
			<text class="tips-text">4. 提交后将在 1-3 个工作日内完成审核</text>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleSubmit">提交审核</view>
		</view>
	</view>
</template>

<script>
	const defaultFormData = () => ({
		legalName: '',
		legalIdCardNo: '',
		businessLicense: '',
		extraFiles: []
	})

	const ID_CARD_PATTERN = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

	export default {
		data() {
			return {
				formData: defaultFormData(),
				rules: {
					legalName: {
						rules: [{ required: true, errorMessage: '请输入法人姓名' }]
					},
					legalIdCardNo: {
						rules: [
							{ required: true, errorMessage: '请输入法人身份证号' },
							{ pattern: ID_CARD_PATTERN, errorMessage: '身份证号格式不正确' }
						]
					},
					businessLicense: {
						rules: [{ required: true, errorMessage: '请上传营业执照' }]
					}
				}
			}
		},
		onLoad() {
			this.loadFormData()
		},
		methods: {
			loadFormData() {
				const cached = uni.getStorageSync('businessInfo')
				if (cached) {
					this.formData = {
						...defaultFormData(),
						...cached,
						extraFiles: cached.extraFiles || []
					}
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
			chooseExtraFiles() {
				const remain = 6 - this.formData.extraFiles.length
				uni.chooseImage({
					count: remain,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.formData.extraFiles = [
							...this.formData.extraFiles,
							...res.tempFilePaths
						]
					}
				})
			},
			removeExtraFile(index) {
				this.formData.extraFiles.splice(index, 1)
			},
			handleSubmit() {
				this.$refs.formRef.validate().then(() => {
					uni.setStorageSync('businessInfo', this.formData)
					uni.showToast({
						title: '已提交审核',
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

	.business-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 8rpx 24rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.file-upload {
		width: 100%;
	}

	.file-img,
	.file-placeholder {
		width: 100%;
		height: 320rpx;
		border-radius: 12rpx;
	}

	.file-img {
		background-color: #f5f5f5;
	}

	.file-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 168, 150, 0.08);
		border: 2rpx dashed $primary;
	}

	.file-tip {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: $primary;
	}

	.extra-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.extra-item,
	.extra-add {
		position: relative;
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.extra-img {
		width: 100%;
		height: 100%;
		background-color: #f5f5f5;
	}

	.extra-remove {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.extra-add {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 168, 150, 0.08);
		border: 2rpx dashed $primary;
		box-sizing: border-box;
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
