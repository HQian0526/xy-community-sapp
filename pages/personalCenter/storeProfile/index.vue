<template>
	<view class="store-profile-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="200rpx">
				<uni-forms-item label="店铺照片" name="avatar">
					<view class="photo-upload" @click="chooseStorePhoto">
						<image
							v-if="formData.avatarUrl"
							class="photo-img"
							:src="formData.avatarUrl"
							mode="aspectFill"
						/>
						<view v-else class="photo-placeholder">
							<up-icon name="camera-fill" size="32" color="#00a896"></up-icon>
							<text class="photo-tip">上传店铺照片</text>
						</view>
					</view>
				</uni-forms-item>

				<uni-forms-item label="店铺名称" name="storeName" required>
					<uni-easyinput
						v-model="formData.storeName"
						placeholder="请输入店铺名称"
						maxlength="64"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="店铺手机号" name="phone">
					<view class="phone-row">
						<text class="phone-text">{{ formData.phone || '暂无' }}</text>
						<text class="phone-tip">换绑商铺手机号需找客服</text>
					</view>
				</uni-forms-item>

				<uni-forms-item label="店铺位置" name="address">
					<uni-easyinput
						v-model="formData.address"
						type="textarea"
						autoHeight
						maxlength="255"
						placeholder="选填，用于向顾客展示"
						:inputBorder="false"
					/>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="submit-wrap">
			<view
				class="btn-success submit-btn"
				:class="{ 'is-loading': submitting }"
				@click="handleSubmit"
			>{{ submitting ? '保存中...' : '保存' }}</view>
		</view>
	</view>
</template>

<script>
	import {
		requireLogin,
		ensureUserInfo
	} from '@/common/auth.js'
	import {
		FILE_BASE_URL,
		resolveFileUrl
	} from '@/common/api/config.js'
	import {
		getStoreListApi,
		updateStoreProfileApi,
		uploadStoreImageApi
	} from '@/common/api/personalCenter/store.js'

	const defaultFormData = () => ({
		id: '',
		storeName: '',
		phone: '',
		address: '',
		avatar: '',
		avatarUrl: ''
	})

	function toStoredFilePath(path) {
		if (!path) return ''
		const value = String(path).trim()
		if (!value) return ''
		const base = FILE_BASE_URL.replace(/\/$/, '')
		if (value.indexOf(base) === 0) {
			return value.slice(base.length)
		}
		return value
	}

	export default {
		data() {
			return {
				submitting: false,
				uploading: false,
				formData: defaultFormData(),
				rules: {
					storeName: {
						rules: [{
							required: true,
							errorMessage: '请输入店铺名称'
						}]
					}
				}
			}
		},
		async onLoad() {
			const ok = await requireLogin({
				force: true
			})
			if (!ok) return
			await this.loadFormData()
		},
		methods: {
			async loadFormData() {
				try {
					const user = await ensureUserInfo()
					if (!user?.id) {
						uni.showToast({
							title: '未获取到用户信息',
							icon: 'none'
						})
						return
					}
					const data = await getStoreListApi({
						userId: user.id
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
					const avatar = store.avatar || ''
					this.formData = {
						id: store.id != null ? String(store.id) : '',
						storeName: store.storeName || '',
						phone: store.identityPhone || '',
						address: store.address || '',
						avatar,
						avatarUrl: resolveFileUrl(avatar)
					}
				} catch (error) {
					console.error('获取商家资料失败', error)
				}
			},
			chooseStorePhoto() {
				if (this.uploading || this.submitting) return
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						const filePath = (res.tempFilePaths || [])[0]
						if (!filePath) return
						this.uploading = true
						try {
							const uploaded = await uploadStoreImageApi(filePath)
							const avatar = toStoredFilePath(uploaded)
							if (!avatar) {
								uni.showToast({
									title: '上传失败，请重试',
									icon: 'none'
								})
								return
							}
							this.formData.avatar = avatar
							this.formData.avatarUrl = resolveFileUrl(avatar)
						} catch (error) {
							console.error('上传店铺照片失败', error)
						} finally {
							this.uploading = false
						}
					}
				})
			},
			async handleSubmit() {
				if (this.submitting || this.uploading) return
				try {
					await this.$refs.formRef.validate()
				} catch (e) {
					return
				}
				const storeName = String(this.formData.storeName || '').trim()
				if (!storeName) {
					uni.showToast({
						title: '请输入店铺名称',
						icon: 'none'
					})
					return
				}

				this.submitting = true
				try {
					await updateStoreProfileApi({
						storeName,
						avatar: this.formData.avatar || '',
						address: String(this.formData.address || '').trim()
					})
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1200)
				} catch (error) {
					console.error('保存商家资料失败', error)
				} finally {
					this.submitting = false
				}
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
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 8rpx 24rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
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

	.phone-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 72rpx;
		gap: 16rpx;
	}

	.phone-text {
		flex: 1;
		min-width: 0;
		font-size: 28rpx;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.phone-tip {
		flex-shrink: 0;
		max-width: 280rpx;
		font-size: 22rpx;
		color: #999;
		line-height: 1.4;
		text-align: right;
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

	.submit-btn.is-loading {
		opacity: 0.7;
	}
</style>
