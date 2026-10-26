<template>
	<view class="recharge-page">
		<view class="info-card">
			<view class="info-row">
				<text class="info-label">昵称</text>
				<text class="info-value">{{ displayNickname }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">手机号</text>
				<text class="info-value">{{ displayPhone }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">储值余额</text>
				<view class="balance-wrap">
					<text class="currency">¥</text>
					<text class="balance">{{ formatMemberBalance(customer.balance) }}</text>
				</view>
			</view>
			<text v-if="customer.loaded && !customer.member" class="info-tip">储值成功后将成为本店储值会员，享受会员价等权益</text>
			<text v-else-if="customer.member" class="info-tip ok">该顾客已是本店储值会员</text>
		</view>

		<view class="form-card">
			<text class="card-title">储值金额</text>
			<view class="amount-row">
				<text class="amount-prefix">¥</text>
				<input
					class="amount-input"
					type="digit"
					:value="amount"
					placeholder="请输入储值金额"
					@input="onAmountInput"
				/>
			</view>
		</view>

		<view class="form-card">
			<text class="card-title">备注</text>
			<textarea
				class="remark-input"
				:value="remark"
				maxlength="200"
				placeholder="选填，如现金收款、转账等"
				@input="onRemarkInput"
			></textarea>
			<text class="remark-count">{{ remark.length }}/200</text>
		</view>

		<view
			class="submit-btn"
			:class="{ disabled: !canSubmit || submitting }"
			@click="handleConfirm"
		>确认储值</view>
	</view>
</template>

<script>
	import { requireLogin, getUserInfo } from '@/common/auth.js'
	import { shouldForceOrdinaryUi } from '@/common/storeVisit.js'
	import { getMiniappUi, isStorePayEnabled, syncMerchantMiniappUi } from '@/common/miniappUi.js'
	import {
		assistStoreMemberRechargeApi,
		formatMemberBalance,
		lookupStoreMemberApi
	} from '@/common/api/mall/member.js'

	export default {
		data() {
			return {
				userId: '',
				amount: '',
				remark: '',
				submitting: false,
				customer: {
					loaded: false,
					userId: '',
					phone: '',
					nickname: '',
					member: false,
					balance: 0
				}
			}
		},
		computed: {
			displayNickname() {
				return this.customer.nickname || '微信用户'
			},
			displayPhone() {
				return this.customer.phone || '未授权手机号'
			},
			payAmount() {
				const n = Number(this.amount)
				return Number.isFinite(n) ? Number(n.toFixed(2)) : 0
			},
			canSubmit() {
				return !!this.userId && this.payAmount >= 0.01
			}
		},
		onLoad(query) {
			this.userId = String(query?.userId || '')
			this.customer.nickname = decodeURIComponent(query?.nickname || '')
			this.customer.phone = decodeURIComponent(query?.phone || '')
			this.customer.userId = this.userId
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			const user = getUserInfo()
			const merchantUi = Number(user?.identityType) === 2 && !shouldForceOrdinaryUi(user)
			if (!merchantUi && Number(user?.identityType) !== 3) {
				uni.showToast({ title: '仅商家可用', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 800)
				return
			}
			try {
				await syncMerchantMiniappUi(user)
			} catch (error) {
				console.error('同步店铺支付权限失败', error)
			}
			if (!isStorePayEnabled()) {
				uni.showToast({ title: '当前店铺未接入支付', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 800)
				return
			}
			if (!this.userId) {
				uni.showToast({ title: '顾客信息不完整', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 800)
				return
			}
			this.loadCustomer()
		},
		methods: {
			formatMemberBalance,
			resolveStoreId() {
				return getMiniappUi()?.storeId || ''
			},
			onAmountInput(event) {
				let value = String(event?.detail?.value || '').replace(/[^\d.]/g, '')
				const firstDot = value.indexOf('.')
				if (firstDot >= 0) {
					value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, '')
					const decimals = value.slice(firstDot + 1)
					if (decimals.length > 2) {
						value = value.slice(0, firstDot + 3)
					}
				}
				this.amount = value
			},
			onRemarkInput(event) {
				this.remark = String(event?.detail?.value || '').slice(0, 200)
			},
			async loadCustomer() {
				try {
					const params = { userId: this.userId }
					const storeId = this.resolveStoreId()
					if (storeId) params.storeId = storeId
					const data = await lookupStoreMemberApi(params)
					this.customer = {
						loaded: true,
						userId: data?.userId ? String(data.userId) : this.userId,
						phone: data?.phone || this.customer.phone || '',
						nickname: data?.nickname || this.customer.nickname || '微信用户',
						member: !!data?.member,
						balance: Number(data?.balance || 0)
					}
				} catch (error) {
					console.error('查询顾客失败', error)
				}
			},
			async handleConfirm() {
				if (this.submitting) return
				if (!this.userId) {
					uni.showToast({
						title: '顾客信息不完整',
						icon: 'none'
					})
					return
				}
				if (this.payAmount < 0.01) {
					uni.showToast({
						title: '请输入储值金额',
						icon: 'none'
					})
					return
				}
				const nickname = this.displayNickname
				const amountText = this.payAmount.toFixed(2)
				const confirmed = await new Promise((resolve) => {
					uni.showModal({
						title: '确认储值',
						content: `将为「${nickname}」储值 ¥${amountText}，储值后成为本店储值会员`,
						confirmText: '确认储值',
						confirmColor: '#00a896',
						success: (res) => resolve(!!res.confirm),
						fail: () => resolve(false)
					})
				})
				if (!confirmed) return
				this.submitting = true
				try {
					const payload = {
						userId: this.userId,
						amount: this.payAmount
					}
					const remark = String(this.remark || '').trim()
					if (remark) payload.remark = remark
					const storeId = this.resolveStoreId()
					if (storeId) payload.storeId = storeId
					const data = await assistStoreMemberRechargeApi(payload)
					this.customer = {
						loaded: true,
						userId: data?.userId ? String(data.userId) : this.userId,
						phone: data?.phone || this.customer.phone || '',
						nickname: data?.nickname || this.customer.nickname || '微信用户',
						member: data?.member != null ? !!data.member : true,
						balance: Number(data?.balance || 0)
					}
					this.amount = ''
					this.remark = ''
					uni.showToast({
						title: '储值成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('储值失败', error)
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.recharge-page {
		min-height: 100vh;
		background-color: #f5f6f8;
		padding: 24rpx 24rpx calc(48rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.form-card,
	.info-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 32rpx 28rpx;
		margin-bottom: 20rpx;
	}

	.card-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
	}

	.amount-row {
		display: flex;
		align-items: center;
		height: 88rpx;
		padding: 0 20rpx;
		border: 2rpx solid #eee;
		border-radius: 12rpx;
		box-sizing: border-box;
	}

	.amount-input {
		flex: 1;
		font-size: 32rpx;
		color: #333;
	}

	.amount-prefix {
		font-size: 32rpx;
		color: #00a896;
		font-weight: 600;
		margin-right: 12rpx;
	}

	.remark-input {
		width: 100%;
		min-height: 160rpx;
		padding: 16rpx 20rpx;
		border: 2rpx solid #eee;
		border-radius: 12rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}

	.remark-count {
		display: block;
		margin-top: 8rpx;
		text-align: right;
		font-size: 22rpx;
		color: #bbb;
	}

	.info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 72rpx;
	}

	.info-row + .info-row {
		border-top: 1rpx solid #f2f2f2;
	}

	.info-label {
		font-size: 28rpx;
		color: #888;
	}

	.info-value {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.balance-wrap {
		display: flex;
		align-items: baseline;
	}

	.currency {
		font-size: 26rpx;
		color: #00a896;
		font-weight: 600;
		margin-right: 4rpx;
	}

	.balance {
		font-size: 40rpx;
		font-weight: 700;
		color: #00a896;
	}

	.info-tip {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #fa8c16;
	}

	.info-tip.ok {
		color: #00a896;
	}

	.submit-btn {
		margin-top: 40rpx;
		height: 88rpx;
		border-radius: 44rpx;
		background: #00a896;
		color: #fff;
		font-size: 32rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-btn.disabled {
		opacity: 0.45;
	}
</style>
