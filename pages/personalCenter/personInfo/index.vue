<template>
	<view class="person-info-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="160rpx">
				<uni-forms-item label="头像" name="avatar">
					<view class="avatar-picker" @click="chooseAvatar">
						<image
							v-if="formData.avatar"
							class="avatar-img"
							:src="formData.avatar"
							mode="aspectFill"
						/>
						<view v-else class="avatar-placeholder">
							<up-icon name="camera-fill" size="28" color="#00a896"></up-icon>
							<text class="avatar-tip">上传头像</text>
						</view>
					</view>
				</uni-forms-item>

				<uni-forms-item label="姓名" name="name" required>
					<uni-easyinput v-model="formData.name" placeholder="请输入真实姓名" :inputBorder="false" />
				</uni-forms-item>

				<uni-forms-item label="昵称" name="nickname">
					<uni-easyinput v-model="formData.nickname" placeholder="请输入昵称" :inputBorder="false" />
				</uni-forms-item>

				<uni-forms-item label="性别" name="gender">
					<uni-data-checkbox v-model="formData.gender" :localdata="genderOptions" />
				</uni-forms-item>

				<uni-forms-item label="手机号码" name="phone" required>
					<uni-easyinput
						v-model="formData.phone"
						type="number"
						maxlength="11"
						placeholder="请输入手机号码"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="收货地址" name="address">
					<uni-easyinput
						v-model="formData.address"
						type="textarea"
						autoHeight
						placeholder="请输入详细收货地址"
						:inputBorder="false"
					/>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleSubmit">保存</view>
		</view>
	</view>
</template>

<script>
	const defaultFormData = () => ({
		avatar: '',
		name: '',
		nickname: '',
		gender: 1,
		phone: '',
		address: ''
	})

	export default {
		data() {
			return {
				formData: defaultFormData(),
				genderOptions: [
					{ text: '男', value: 1 },
					{ text: '女', value: 2 }
				],
				rules: {
					name: {
						rules: [{ required: true, errorMessage: '请输入姓名' }]
					},
					phone: {
						rules: [
							{ required: true, errorMessage: '请输入手机号码' },
							{ pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号码格式不正确' }
						]
					}
				}
			}
		},
		onLoad() {
			this.loadFormData()
		},
		methods: {
			loadFormData() {
				const cached = uni.getStorageSync('personInfo')
				if (cached) {
					this.formData = { ...defaultFormData(), ...cached }
				}
			},
			chooseAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.formData.avatar = res.tempFilePaths[0]
					}
				})
			},
			handleSubmit() {
				this.$refs.formRef.validate().then(() => {
					uni.setStorageSync('personInfo', this.formData)
					uni.showToast({
						title: '保存成功',
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

	.person-info-page {
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

	.avatar-picker {
		display: flex;
		// justify-content: flex-end;
	}

	.avatar-img,
	.avatar-placeholder {
		width: 128rpx;
		height: 128rpx;
		border-radius: 50%;
	}

	.avatar-img {
		background-color: #f5f5f5;
	}

	.avatar-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 168, 150, 0.08);
		border: 2rpx dashed $primary;
	}

	.avatar-tip {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: $primary;
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
