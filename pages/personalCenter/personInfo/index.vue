<template>
	<view class="person-info-page">
		<view class="form-card">
			<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="200rpx">
				<uni-forms-item label="昵称" name="realName" required>
					<uni-easyinput
						v-model="formData.realName"
						placeholder="请输入昵称"
						maxlength="64"
						:inputBorder="false"
					/>
				</uni-forms-item>

				<uni-forms-item label="性别" name="sex">
					<up-radio-group v-model="formData.sex" placement="row" activeColor="#00a896">
						<up-radio :name="1" label="男"></up-radio>
						<up-radio :name="0" label="女"></up-radio>
					</up-radio-group>
				</uni-forms-item>

				<uni-forms-item label="手机号" name="phone">
					<view class="phone-row">
						<text class="phone-text">{{ formData.phone || '未授权手机号' }}</text>
						<!-- #ifdef MP-WEIXIN -->
						<button
							class="auth-btn"
							open-type="getPhoneNumber"
							:disabled="phoneLoading"
							@getphonenumber="onGetPhoneNumber"
						>{{ phoneLoading ? '授权中...' : '授权手机号' }}</button>
						<!-- #endif -->
						<!-- #ifndef MP-WEIXIN -->
						<text class="auth-btn-text" @click="onNonWxAuthTap">授权手机号</text>
						<!-- #endif -->
					</view>
				</uni-forms-item>

				<uni-forms-item label="默认收货地址" name="address">
					<uni-easyinput
						v-model="formData.address"
						type="textarea"
						autoHeight
						maxlength="255"
						placeholder="选填，请输入详细收货地址"
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
		ensureUserInfo,
		getUserInfo,
		getToken,
		saveLoginInfo
	} from '@/common/auth.js'
	import {
		bindPhoneByCode
	} from '@/common/bindPhoneUi.js'
	import {
		updateProfileApi
	} from '@/common/api/personalCenter/user.js'

	const defaultFormData = () => ({
		id: '',
		realName: '',
		sex: null,
		phone: '',
		address: ''
	})

	function mapSex(value) {
		if (value === 0 || value === '0') return 0
		if (value === 1 || value === '1') return 1
		return null
	}

	export default {
		data() {
			return {
				submitting: false,
				phoneLoading: false,
				formData: defaultFormData(),
				rules: {
					realName: {
						rules: [{
							required: true,
							errorMessage: '请输入昵称'
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
					const user = await ensureUserInfo({
						force: true
					}) || getUserInfo() || {}
					this.formData = {
						id: user.id != null ? String(user.id) : '',
						realName: user.realName || user.userName || '',
						sex: mapSex(user.sex),
						phone: user.phone || '',
						address: user.address || ''
					}
				} catch (error) {
					console.error('获取用户资料失败', error)
				}
			},
			onNonWxAuthTap() {
				uni.showToast({
					title: '请在微信小程序中授权',
					icon: 'none'
				})
			},
			async onGetPhoneNumber(e) {
				const detail = e?.detail || {}
				const errMsg = detail.errMsg || ''
				if (errMsg && errMsg.indexOf('ok') === -1) {
					uni.showToast({
						title: '未授权手机号，可稍后再试',
						icon: 'none'
					})
					return
				}
				if (!detail.code) {
					uni.showToast({
						title: '未获取到手机号授权',
						icon: 'none'
					})
					return
				}
				if (this.phoneLoading) return
				this.phoneLoading = true
				try {
					const result = await bindPhoneByCode(detail.code)
					const user = result.userInfo || getUserInfo() || {}
					this.formData.phone = user.phone || this.formData.phone
					if (user.id != null) {
						this.formData.id = String(user.id)
					}
					uni.showToast({
						title: result.merged ? '账号已合并' : '手机号绑定成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('绑定手机号失败', error)
				} finally {
					this.phoneLoading = false
				}
			},
			async handleSubmit() {
				if (this.submitting) return
				try {
					await this.$refs.formRef.validate()
				} catch (e) {
					return
				}
				const realName = String(this.formData.realName || '').trim()
				if (!realName) {
					uni.showToast({
						title: '请输入昵称',
						icon: 'none'
					})
					return
				}

				this.submitting = true
				try {
					const payload = {
						realName,
						address: String(this.formData.address || '').trim()
					}
					if (this.formData.sex === 0 || this.formData.sex === 1) {
						payload.sex = this.formData.sex
					}
					const saved = await updateProfileApi(payload)
					if (saved) {
						saveLoginInfo(getToken(), {
							...(getUserInfo() || {}),
							...saved
						})
					} else {
						await ensureUserInfo({
							force: true
						})
					}
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1200)
				} catch (error) {
					console.error('保存资料失败', error)
				} finally {
					this.submitting = false
				}
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
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.form-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 8rpx 24rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
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

	.auth-btn {
		flex-shrink: 0;
		margin: 0;
		padding: 0 20rpx;
		height: 56rpx;
		line-height: 56rpx;
		font-size: 24rpx;
		color: #fff;
		background-color: $primary;
		border-radius: 28rpx;
		border: none;

		&::after {
			border: none;
		}

		&[disabled] {
			opacity: 0.7;
		}
	}

	.auth-btn-text {
		flex-shrink: 0;
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

	.submit-btn.is-loading {
		opacity: 0.7;
	}
</style>
