<template>
	<view class="publish-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="160rpx">
				<uni-forms-item label="求助类型" name="helpType" required>
					<view class="type-picker" @click="openTypeSheet">
						<text :class="formData.helpType ? 'type-value' : 'type-placeholder'">
							{{ formData.helpType || '请选择求助类型' }}
						</text>
						<up-icon name="arrow-right" size="14" color="#c0c4cc"></up-icon>
					</view>
				</uni-forms-item>

				<uni-forms-item label="答谢金额" name="reward" required>
					<view class="reward-input">
						<uni-easyinput
							v-model="formData.reward"
							type="digit"
							placeholder="请输入答谢金额"
							:inputBorder="false"
							@blur="formatReward"
							@input="handleRewardInput"
						/>
						<text class="reward-unit">元</text>
					</view>
				</uni-forms-item>

				<uni-forms-item v-if="isPickupType" label="取件码" name="pickupCode">
					<uni-easyinput
						v-model="formData.pickupCode"
						type="textarea"
						autoHeight
						placeholder="例如：1号柜2-2-9876 或者 尾号9876，如果没有则不填"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item v-if="showTaskDetail" label="任务详情" name="detail">
					<uni-easyinput
						v-model="formData.detail"
						type="textarea"
						autoHeight
						placeholder="请描述任务内容、要求等信息"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="联系方式" name="contact" required>
					<uni-easyinput
						v-model="formData.contact"
						type="number"
						maxlength="11"
						placeholder="请输入手机号码"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="收货地址" name="address" required>
					<uni-easyinput
						v-model="formData.address"
						type="textarea"
						autoHeight
						placeholder="请输入详细收货地址"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="备注" name="remark">
					<uni-easyinput
						v-model="formData.remark"
						type="textarea"
						autoHeight
						placeholder="选填，可补充其他说明"
						:inputBorder="false"
					/>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleSubmit">确认发布</view>
		</view>

		<u-action-sheet
			:show="typeSheetShow"
			:actions="helpTypeList"
			cancelText="取消"
			round="16"
			@close="closeTypeSheet"
			@select="handleTypeSelect"
		></u-action-sheet>
	</view>
</template>

<script>
	const defaultFormData = () => ({
		helpType: '',
		reward: '',
		pickupCode: '',
		detail: '',
		contact: '',
		address: '',
		remark: ''
	})

	const OTHER_HELP_TYPES = ['代购', '维修', '其他']

	export default {
		data() {
			return {
				formData: defaultFormData(),
				typeSheetShow: false,
				helpTypeList: [
					{ name: '取件' },
					{ name: '代购' },
					{ name: '维修' },
					{ name: '其他' }
				],
				rules: {
					helpType: {
						rules: [{ required: true, errorMessage: '请选择求助类型' }]
					},
					reward: {
						rules: [
							{ required: true, errorMessage: '请输入悬赏金额' },
							{
								validateFunction: (rule, value, data, callback) => {
									if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
										callback('悬赏金额格式不正确，最多保留两位小数')
										return
									}
									if (parseFloat(value) <= 0) {
										callback('悬赏金额需大于 0')
										return
									}
									callback()
								}
							}
						]
					},
					address: {
						rules: [{ required: true, errorMessage: '请输入收货地址' }]
					},
					contact: {
						rules: [
							{ required: true, errorMessage: '请输入联系方式' },
							{ pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号码格式不正确' }
						]
					}
				}
			}
		},
		computed: {
			isPickupType() {
				return this.formData.helpType === '取件'
			},
			showTaskDetail() {
				return OTHER_HELP_TYPES.includes(this.formData.helpType)
			}
		},
		onLoad() {
			this.loadDefaultInfo()
		},
		methods: {
			loadDefaultInfo() {
				const personInfo = uni.getStorageSync('personInfo')
				if (personInfo) {
					if (personInfo.address) {
						this.formData.address = personInfo.address
					}
					if (personInfo.phone) {
						this.formData.contact = personInfo.phone
					}
				}
			},
			openTypeSheet() {
				this.typeSheetShow = true
			},
			closeTypeSheet() {
				this.typeSheetShow = false
			},
			handleTypeSelect(item) {
				const prevType = this.formData.helpType
				this.formData.helpType = item.name
				if (prevType !== item.name) {
					if (item.name === '取件') {
						this.formData.detail = ''
					} else {
						this.formData.pickupCode = ''
					}
				}
				this.closeTypeSheet()
			},
			handleRewardInput(value) {
				let val = String(value || '')
				val = val.replace(/[^\d.]/g, '')
				const parts = val.split('.')
				if (parts.length > 2) {
					val = parts[0] + '.' + parts.slice(1).join('')
				}
				if (parts.length === 2 && parts[1].length > 2) {
					val = parts[0] + '.' + parts[1].slice(0, 2)
				}
				this.formData.reward = val
			},
			formatReward() {
				if (!this.formData.reward) return
				const num = parseFloat(this.formData.reward)
				if (!isNaN(num) && num > 0) {
					this.formData.reward = num.toFixed(2)
				}
			},
			handleSubmit() {
				this.formatReward()
				this.$refs.formRef.validate().then(() => {
					uni.showToast({
						title: '发布成功',
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

	.publish-page {
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

	.type-picker {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 72rpx;
		padding-right: 8rpx;
	}

	.type-value {
		font-size: 28rpx;
		color: #333;
	}

	.type-placeholder {
		font-size: 28rpx;
		color: #999;
	}

	.reward-input {
		display: flex;
		align-items: center;
	}

	.reward-unit {
		flex-shrink: 0;
		margin-left: 8rpx;
		font-size: 28rpx;
		color: #666;
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
