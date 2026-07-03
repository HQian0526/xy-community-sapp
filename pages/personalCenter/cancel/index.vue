<template>
	<view class="cancel-page">
		<view v-if="taskInfo.companyName" class="task-brief">
			<text class="task-name">{{ taskInfo.companyName }}</text>
			<text class="task-code">工单编码：{{ taskInfo.orderCode }}</text>
		</view>

		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="160rpx">
				<uni-forms-item label="取消原因" name="cancelReason" required>
					<view class="reason-picker" @click="openReasonSheet">
						<text :class="formData.cancelReason ? 'reason-value' : 'reason-placeholder'">
							{{ formData.cancelReason || '请选择取消原因' }}
						</text>
						<up-icon name="arrow-right" size="14" color="#c0c4cc"></up-icon>
					</view>
				</uni-forms-item>

				<uni-forms-item label="具体原因" name="detailReason" required>
					<uni-easyinput
						v-model="formData.detailReason"
						type="textarea"
						autoHeight
						placeholder="请详细说明取消原因"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="拍照上传" name="photos">
					<view class="photo-list">
						<view
							v-for="(photo, index) in formData.photos"
							:key="index"
							class="photo-item"
						>
							<image class="photo-img" :src="photo" mode="aspectFill" @click="previewPhoto(index)" />
							<view class="photo-delete" @click.stop="removePhoto(index)">
								<up-icon name="close" size="12" color="#fff"></up-icon>
							</view>
						</view>
						<view v-if="formData.photos.length < maxPhotos" class="photo-add" @click="choosePhotos">
							<up-icon name="camera-fill" size="32" color="#00a896"></up-icon>
							<text class="photo-tip">上传照片</text>
						</view>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleSubmit">确认取消</view>
		</view>

		<u-action-sheet
			:show="reasonSheetShow"
			:actions="cancelReasonList"
			cancelText="取消"
			round="16"
			@close="closeReasonSheet"
			@select="handleReasonSelect"
		></u-action-sheet>
	</view>
</template>

<script>
	import { cancelReasonList } from './mock.js'
	import { getPendingTasks, completePendingTask } from '../pending/mock.js'

	const defaultFormData = () => ({
		cancelReason: '',
		detailReason: '',
		photos: []
	})

	export default {
		data() {
			return {
				taskId: '',
				taskInfo: {},
				formData: defaultFormData(),
				reasonSheetShow: false,
				cancelReasonList,
				maxPhotos: 3,
				rules: {
					cancelReason: {
						rules: [{ required: true, errorMessage: '请选择取消原因' }]
					},
					detailReason: {
						rules: [{ required: true, errorMessage: '请填写具体原因' }]
					}
				}
			}
		},
		onLoad(options) {
			this.taskId = options.id || ''
			this.loadTaskInfo()
		},
		methods: {
			loadTaskInfo() {
				const task = getPendingTasks().find(item => item.id === this.taskId)
				if (task) {
					this.taskInfo = task
					return
				}
				uni.showToast({
					title: '任务不存在',
					icon: 'none'
				})
				setTimeout(() => {
					uni.navigateBack()
				}, 1200)
			},
			openReasonSheet() {
				this.reasonSheetShow = true
			},
			closeReasonSheet() {
				this.reasonSheetShow = false
			},
			handleReasonSelect(item) {
				this.formData.cancelReason = item.name
				this.closeReasonSheet()
			},
			choosePhotos() {
				const remain = this.maxPhotos - this.formData.photos.length
				uni.chooseImage({
					count: remain,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.formData.photos = [...this.formData.photos, ...res.tempFilePaths]
					}
				})
			},
			removePhoto(index) {
				this.formData.photos.splice(index, 1)
			},
			previewPhoto(index) {
				uni.previewImage({
					current: index,
					urls: this.formData.photos
				})
			},
			handleSubmit() {
				this.$refs.formRef.validate().then(() => {
					uni.showModal({
						title: '确认取消',
						content: '确定要取消该工单吗？取消后将无法恢复',
						success: (res) => {
							if (!res.confirm) return
							completePendingTask(this.taskId)
							uni.showToast({
								title: '工单已取消',
								icon: 'success'
							})
							setTimeout(() => {
								uni.navigateBack()
							}, 1200)
						}
					})
				}).catch(() => {})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.cancel-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.task-brief {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.task-name {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 8rpx;
	}

	.task-code {
		font-size: 24rpx;
		color: #999;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 8rpx 24rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.reason-picker {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 72rpx;
		padding-right: 8rpx;
	}

	.reason-value {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		padding-right: 16rpx;
	}

	.reason-placeholder {
		font-size: 28rpx;
		color: #999;
	}

	.photo-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.photo-item,
	.photo-add {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.photo-item {
		position: relative;
	}

	.photo-img {
		width: 100%;
		height: 100%;
		background-color: #f5f5f5;
	}

	.photo-delete {
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

	.photo-add {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 168, 150, 0.08);
		border: 2rpx dashed $primary;
	}

	.photo-tip {
		margin-top: 8rpx;
		font-size: 22rpx;
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
