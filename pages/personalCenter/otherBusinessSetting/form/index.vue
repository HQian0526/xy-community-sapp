<template>
	<view class="form-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="160rpx">
				<uni-forms-item label="业务名称" name="name" required>
					<uni-easyinput
						v-model="formData.name"
						placeholder="请输入业务名称"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="描述" name="description">
					<uni-easyinput
						v-model="formData.description"
						type="textarea"
						autoHeight
						placeholder="选填，可补充业务说明"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="收费标准" name="fee" required>
					<uni-easyinput
						v-model="formData.fee"
						placeholder="例如：50元/件、1元/张"
						:inputBorder="false"
					/>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleSubmit">{{ isEdit ? '保存修改' : '确认新增' }}</view>
		</view>
	</view>
</template>

<script>
	import {
		getOtherBusinessById,
		saveOtherBusiness
	} from '../mock.js'

	const defaultFormData = () => ({
		id: '',
		name: '',
		description: '',
		fee: ''
	})

	export default {
		data() {
			return {
				isEdit: false,
				formData: defaultFormData(),
				rules: {
					name: {
						rules: [{ required: true, errorMessage: '请输入业务名称' }]
					},
					fee: {
						rules: [{ required: true, errorMessage: '请输入收费标准' }]
					}
				}
			}
		},
		onLoad(options) {
			if (options.id) {
				this.isEdit = true
				const item = getOtherBusinessById(options.id)
				if (item) {
					this.formData = { ...item }
				}
			}
			uni.setNavigationBarTitle({
				title: this.isEdit ? '编辑业务' : '新增业务'
			})
		},
		methods: {
			handleSubmit() {
				this.$refs.formRef.validate().then(() => {
					saveOtherBusiness({ ...this.formData })
					uni.showToast({
						title: this.isEdit ? '修改成功' : '新增成功',
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
	.form-page {
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
