<template>
	<view class="verify-page">
		<view class="form-card">
			<text class="card-title">顾客手机号</text>
			<view class="phone-row">
				<input
					class="phone-input"
					type="number"
					maxlength="11"
					:value="phone"
					placeholder="请输入顾客手机号"
					@input="onPhoneInput"
					@confirm="handleLookup"
				/>
				<view
					class="query-btn"
					:class="{ disabled: querying || !phoneReady }"
					@click="handleLookup"
				>{{ querying ? '查询中' : '查询' }}</view>
			</view>
		</view>

		<view v-if="customer" class="info-card">
			<view class="info-row">
				<text class="info-label">昵称</text>
				<text class="info-value">{{ customer.nickname }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">储值余额</text>
				<view class="balance-wrap">
					<text class="currency">¥</text>
					<text class="balance">{{ formatMemberBalance(customer.balance) }}</text>
				</view>
			</view>
			<text v-if="!customer.member" class="info-tip">该顾客尚未成为本店会员</text>
		</view>

		<view class="form-card">
			<text class="card-title">核验金额</text>
			<view class="amount-row">
				<text class="amount-prefix">¥</text>
				<input
					class="amount-input"
					type="digit"
					:value="amount"
					placeholder="请输入核验金额"
					@input="onAmountInput"
				/>
			</view>
		</view>

		<view
			class="submit-btn"
			:class="{ disabled: !canSubmit || submitting }"
			@click="handleConfirm"
		>确认核验</view>
	</view>
</template>

<script>
	import { requireLogin, getUserInfo } from '@/common/auth.js'
	import { shouldForceOrdinaryUi } from '@/common/storeVisit.js'
	import { getMiniappUi } from '@/common/miniappUi.js'
	import {
		formatMemberBalance,
		lookupStoreMemberByPhoneApi,
		verifyStoreMemberDebitApi
	} from '@/common/api/mall/member.js'

	const PHONE_REG = /^1[3-9]\d{9}$/

	export default {
		data() {
			return {
				phone: '',
				amount: '',
				customer: null,
				querying: false,
				submitting: false
			}
		},
		computed: {
			phoneReady() {
				return PHONE_REG.test(this.phone)
			},
			payAmount() {
				const n = Number(this.amount)
				return Number.isFinite(n) ? Number(n.toFixed(2)) : 0
			},
			canSubmit() {
				return this.phoneReady && this.payAmount > 0
			}
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			const user = getUserInfo()
			const merchantUi = Number(user?.identityType) === 2 && !shouldForceOrdinaryUi(user)
			if (!merchantUi) {
				uni.showToast({ title: '仅商家可用', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 800)
				return
			}
			if (getMiniappUi()?.enablePay === false) {
				uni.showToast({ title: '当前店铺未接入支付', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 800)
			}
		},
		methods: {
			formatMemberBalance,
			resolveStoreId() {
				return getMiniappUi()?.storeId || ''
			},
			onPhoneInput(event) {
				const next = String(event?.detail?.value || '').replace(/\D/g, '').slice(0, 11)
				if (next !== this.phone) {
					this.phone = next
					if (!this.customer || this.customer.phone !== next) {
						this.customer = null
					}
					if (PHONE_REG.test(next)) {
						this.handleLookup()
					}
				}
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
			async handleLookup() {
				if (this.querying) return
				if (!this.phoneReady) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				}
				const phone = this.phone
				this.querying = true
				try {
					const data = await lookupStoreMemberByPhoneApi(phone, this.resolveStoreId())
					if (this.phone !== phone) return
					this.customer = {
						userId: data?.userId ? String(data.userId) : '',
						phone: data?.phone || phone,
						nickname: data?.nickname || '微信用户',
						member: !!data?.member,
						balance: Number(data?.balance || 0)
					}
				} catch (error) {
					if (this.phone === phone) {
						this.customer = null
					}
					console.error('查询顾客失败', error)
				} finally {
					this.querying = false
				}
			},
			async handleConfirm() {
				if (this.submitting) return
				if (!this.phoneReady) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				}
				if (this.payAmount <= 0) {
					uni.showToast({
						title: '请输入正确的核验金额',
						icon: 'none'
					})
					return
				}
				if (this.customer && this.payAmount > Number(this.customer.balance || 0)) {
					uni.showToast({
						title: '余额不足',
						icon: 'none'
					})
					return
				}
				const nickname = this.customer?.nickname || this.phone
				const amountText = this.payAmount.toFixed(2)
				const confirmed = await new Promise((resolve) => {
					uni.showModal({
						title: '确认核验',
						content: `将从「${nickname}」的储值余额扣除 ¥${amountText}`,
						confirmText: '确认扣除',
						confirmColor: '#00a896',
						success: (res) => resolve(!!res.confirm),
						fail: () => resolve(false)
					})
				})
				if (!confirmed) return
				this.submitting = true
				try {
					const payload = {
						phone: this.phone,
						amount: this.payAmount
					}
					const storeId = this.resolveStoreId()
					if (storeId) {
						payload.storeId = storeId
					}
					const data = await verifyStoreMemberDebitApi(payload)
					this.customer = {
						userId: data?.userId ? String(data.userId) : (this.customer?.userId || ''),
						phone: data?.phone || this.phone,
						nickname: data?.nickname || this.customer?.nickname || '微信用户',
						member: data?.member != null ? !!data.member : !!this.customer?.member,
						balance: Number(data?.balance || 0)
					}
					this.amount = ''
					uni.showToast({
						title: '核验成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('核验失败', error)
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.verify-page {
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

	.phone-row,
	.amount-row {
		display: flex;
		align-items: center;
		height: 88rpx;
		padding: 0 20rpx;
		border: 2rpx solid #eee;
		border-radius: 12rpx;
		box-sizing: border-box;
	}

	.phone-input,
	.amount-input {
		flex: 1;
		font-size: 32rpx;
		color: #333;
	}

	.query-btn {
		flex-shrink: 0;
		margin-left: 16rpx;
		padding: 0 28rpx;
		height: 64rpx;
		line-height: 64rpx;
		border-radius: 32rpx;
		background: #00a896;
		color: #fff;
		font-size: 26rpx;
		font-weight: 600;
	}

	.query-btn.disabled {
		opacity: 0.45;
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

	.amount-prefix {
		font-size: 32rpx;
		color: #00a896;
		font-weight: 600;
		margin-right: 12rpx;
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
