<template>
	<view class="apply-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="160rpx">
				<uni-forms-item label="姓名" name="name" required>
					<uni-easyinput
						v-model="formData.name"
						placeholder="请输入姓名"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="联系方式" name="contact" required>
					<uni-easyinput
						v-model="formData.contact"
						type="number"
						maxlength="11"
						placeholder="请输入11位手机号码"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="微信号" name="wechatId">
					<uni-easyinput
						v-model="formData.wechatId"
						placeholder="选填，便于客服添加您"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<!--
				<uni-forms-item label="绑定区域" name="region" required>
					<uni-easyinput
						v-model="formData.region"
						placeholder="请输入高校/社区名称"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="详细地址" name="address" required>
					<uni-easyinput
						v-model="formData.address"
						type="textarea"
						autoHeight
						placeholder="请输入绑定区域的详细地址"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="入驻费用">
					<view class="fee-value">
						<text class="fee-amount">¥{{ joinFee }}元</text>
						<text class="fee-tip">（限时特惠价，享永久经营权）</text>
					</view>
				</uni-forms-item>
				-->
			</uni-forms>
			<text class="apply-tip">稍后客服将尽快添加您</text>
		</view>

		<view class="submit-wrap">
			<view
				class="btn-success submit-btn"
				:class="{ 'submit-btn--disabled': submitting }"
				@click="handleSubmit"
			>
				提交
			</view>
		</view>
	</view>
</template>

<script>
	import { requireLogin, getUserInfo } from '@/common/auth.js'
	import { addVisitorApi } from '@/common/api/join/visitor.js'

	const defaultFormData = () => ({
		name: '',
		contact: '',
		wechatId: ''
	})

	export default {
		data() {
			return {
				formData: defaultFormData(),
				submitting: false,
				rules: {
					name: {
						rules: [{ required: true, errorMessage: '请输入姓名' }]
					},
					contact: {
						rules: [
							{ required: true, errorMessage: '请输入联系方式' },
							{ pattern: /^1[3-9]\d{9}$/, errorMessage: '请输入正确的11位手机号码' }
						]
					}
				}
			}
		},
		methods: {
			async handleSubmit() {
				if (this.submitting) return
				try {
					await this.$refs.formRef.validate()
				} catch (e) {
					return
				}

				const ok = await requireLogin({
					force: true
				})
				if (!ok) return

				this.submitting = true
				try {
					const wechatId = String(this.formData.wechatId || '').trim()
					const bindStoreId = getUserInfo()?.bindStoreId
					const payload = {
						visitorName: String(this.formData.name || '').trim(),
						phone: String(this.formData.contact || '').trim(),
						remark: wechatId ? `微信号：${wechatId}` : ''
					}
					if (bindStoreId !== undefined && bindStoreId !== null && String(bindStoreId).trim() !== '') {
						payload.storeId = bindStoreId
					}
					await addVisitorApi(payload)
					uni.showToast({
						title: '申请已提交',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1200)
				} catch (error) {
					console.error('提交入驻申请失败', error)
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.apply-page {
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

	.apply-tip {
		display: block;
		margin-top: 8rpx;
		padding: 0 8rpx;
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;
	}

	.fee-value {
		min-height: 72rpx;
		display: flex;
		align-items: center;
	}

	.fee-amount {
		font-size: 32rpx;
		font-weight: 600;
		color: $primary;
	}

	.fee-tip {
		font-size: 20rpx;
		color: #999;
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

	.submit-btn--disabled {
		opacity: 0.5;
	}
</style>
