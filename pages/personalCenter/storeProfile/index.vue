<template>
	<view class="store-profile-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="160rpx">
				<uni-forms-item label="店铺名称" name="storeName" required>
					<uni-easyinput
						v-model="formData.storeName"
						placeholder="请输入店铺名称"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="手机号">
					<view class="readonly-value">{{ formData.phone || '暂无' }}</view>
				</uni-forms-item>

				<uni-forms-item label="店铺照片" name="storePhoto">
					<view class="photo-upload" @click="chooseStorePhoto">
						<image
							v-if="formData.storePhoto"
							class="photo-img"
							:src="formData.storePhoto"
							mode="aspectFill"
						/>
						<view v-else class="photo-placeholder">
							<up-icon name="camera-fill" size="32" color="#00a896"></up-icon>
							<text class="photo-tip">上传店铺照片</text>
						</view>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleSubmit">确认修改</view>
		</view>
	</view>
</template>

<script>
	import { getStoreProfile, setStoreProfile } from './mock.js'

	export default {
		data() {
			return {
				formData: {
					storeName: '',
					phone: '',
					storePhoto: ''
				},
				rules: {
					storeName: {
						rules: [{ required: true, errorMessage: '请输入店铺名称' }]
					}
				}
			}
		},
		onLoad() {
			this.loadFormData()
		},
		methods: {
			loadFormData() {
				this.formData = { ...getStoreProfile() }
			},
			chooseStorePhoto() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.formData.storePhoto = res.tempFilePaths[0]
					}
				})
			},
			handleSubmit() {
				this.$refs.formRef.validate().then(() => {
					setStoreProfile({ ...this.formData })
					uni.showToast({
						title: '修改成功',
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

	.store-profile-page {
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

	.readonly-value {
		min-height: 72rpx;
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #999;
	}

	.photo-upload {
		display: flex;
	}

	.photo-img,
	.photo-placeholder {
		width: 200rpx;
		height: 200rpx;
		border-radius: 16rpx;
	}

	.photo-img {
		background-color: #f5f5f5;
	}

	.photo-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 168, 150, 0.08);
		border: 2rpx dashed $primary;
	}

	.photo-tip {
		margin-top: 12rpx;
		font-size: 24rpx;
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
</style>
