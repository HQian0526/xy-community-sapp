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
			<view
				class="btn-success submit-btn"
				:class="{ 'is-loading': submitting }"
				@click="handleSubmit"
			>{{ submitting ? '提交中...' : (isEdit ? '保存修改' : '确认新增') }}</view>
		</view>
	</view>
</template>

<script>
	import {
		requireLogin
	} from '@/common/auth.js'
	import {
		getOtherBusinessListApi,
		addOtherBusinessApi,
		updateOtherBusinessApi,
		mapOtherBusinessItem,
		toOtherBusinessPayload
	} from '@/common/api/personalCenter/otherBusiness.js'

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
				submitting: false,
				formData: defaultFormData(),
				rules: {
					name: {
						rules: [{
							required: true,
							errorMessage: '请输入业务名称'
						}]
					},
					fee: {
						rules: [{
							required: true,
							errorMessage: '请输入收费标准'
						}]
					}
				}
			}
		},
		async onLoad(options) {
			const ok = await requireLogin({
				force: true
			})
			if (!ok) return

			if (options.id) {
				this.isEdit = true
				await this.loadDetail(options.id)
			}
			uni.setNavigationBarTitle({
				title: this.isEdit ? '编辑业务' : '新增业务'
			})
		},
		methods: {
			async loadDetail(id) {
				try {
					const data = await getOtherBusinessListApi({
						id
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const item = list[0]
					if (!item) {
						uni.showToast({
							title: '业务不存在或已删除',
							icon: 'none'
						})
						return
					}
					const mapped = mapOtherBusinessItem(item)
					this.formData = {
						id: mapped.id,
						name: mapped.name,
						description: mapped.description,
						fee: mapped.fee
					}
				} catch (error) {
					console.error('获取业务详情失败', error)
				}
			},
			async handleSubmit() {
				if (this.submitting) return
				try {
					await this.$refs.formRef.validate()
				} catch (e) {
					return
				}

				this.submitting = true
				try {
					const payload = toOtherBusinessPayload(this.formData)
					if (this.isEdit) {
						await updateOtherBusinessApi(payload)
					} else {
						await addOtherBusinessApi(payload)
					}
					uni.showToast({
						title: this.isEdit ? '修改成功' : '新增成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1200)
				} catch (error) {
					console.error('保存其他业务失败', error)
				} finally {
					this.submitting = false
				}
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

	.submit-btn.is-loading {
		opacity: 0.7;
	}
</style>
