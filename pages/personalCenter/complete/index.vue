<template>
	<view class="complete-page">
		<view v-if="taskInfo.companyName" class="task-brief">
			<text class="task-name">{{ taskInfo.companyName }}</text>
			<text class="task-code">工单编码：{{ taskInfo.orderCode }}</text>
		</view>

		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" label-width="160rpx">
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
					<text class="photo-hint">选填，可拍照或从相册选择，最多 {{ maxPhotos }} 张</text>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleSubmit">确认完成</view>
		</view>
	</view>
</template>

<script>
	import { MAX_COMPLETE_PHOTOS } from './mock.js'
	import { getPendingTasks, completePendingTask } from '../pending/mock.js'
	import { addFinishedTask } from '../finished/mock.js'

	const defaultFormData = () => ({
		photos: []
	})

	export default {
		data() {
			return {
				taskId: '',
				taskInfo: {},
				formData: defaultFormData(),
				maxPhotos: MAX_COMPLETE_PHOTOS
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
				uni.showModal({
					title: '确认完成',
					content: '确定该任务已完成吗？确认后将移出待处理列表',
					success: (res) => {
						if (!res.confirm) return
						const task = getPendingTasks().find(item => item.id === this.taskId)
						completePendingTask(this.taskId)
						if (task) {
							addFinishedTask(task, { photos: [...this.formData.photos] })
						}
						uni.showToast({
							title: '任务已完成',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1200)
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.complete-page {
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

	.photo-hint {
		display: block;
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;
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
