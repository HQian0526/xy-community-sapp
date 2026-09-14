<template>
	<view class="recharge-page">
		<view class="balance-card">
			<text class="balance-label">{{ memberInfo.member ? '会员余额' : '储值后成为本店会员' }}</text>
			<view class="balance-value">
				<text class="currency">¥</text>
				<text class="amount">{{ formatMemberBalance(memberInfo.balance) }}</text>
			</view>
			<text class="balance-tip">余额仅本店使用，每次储值至少 {{ MIN_RECHARGE_AMOUNT }} 元</text>
		</view>

		<view class="preset-card">
			<text class="card-title">选择金额</text>
			<view class="preset-grid">
				<view
					v-for="item in RECHARGE_PRESETS"
					:key="item"
					class="preset-item"
					:class="{ active: selectedPreset === item && !customMode }"
					@click="selectPreset(item)"
				>
					<view class="preset-inner">
						<text class="preset-amount">{{ item }}</text>
						<text class="preset-unit">元</text>
					</view>
				</view>
				<view
					class="preset-item"
					:class="{ active: customMode }"
					@click="enableCustom"
				>
					<text class="preset-amount custom">自定义</text>
				</view>
			</view>
			<view v-if="customMode" class="custom-row">
				<text class="custom-prefix">¥</text>
				<input
					class="custom-input"
					type="digit"
					:value="customAmount"
					placeholder="请输入不少于100的金额"
					@input="onCustomInput"
				/>
			</view>
		</view>

		<view class="submit-bar">
			<view class="submit-total">
				<text class="submit-label">应付</text>
				<text class="submit-amount">¥{{ formatMemberBalance(payAmount) }}</text>
			</view>
			<view
				class="submit-btn"
				:class="{ disabled: !canPay || paying }"
				@click="handlePay"
			>微信支付</view>
		</view>
	</view>
</template>

<script>
	import {
		requireLogin,
		ensurePhoneBound,
		isLoggedIn,
		getUserInfo
	} from '@/common/auth.js'
	import {
		resolveViewStoreId
	} from '@/common/storeVisit.js'
	import {
		MIN_RECHARGE_AMOUNT,
		RECHARGE_PRESETS,
		formatMemberBalance,
		getStoreMemberMineApi,
		rechargeStoreMemberApi,
		mockConfirmStoreMemberRechargeApi,
		requestStoreMemberRechargePay,
		waitStoreMemberRechargePaid
	} from '@/common/api/mall/member.js'

	export default {
		data() {
			return {
				MIN_RECHARGE_AMOUNT,
				RECHARGE_PRESETS,
				selectedPreset: 100,
				customMode: false,
				customAmount: '',
				paying: false,
				memberInfo: {
					member: false,
					balance: 0,
					storeId: ''
				}
			}
		},
		computed: {
			payAmount() {
				if (this.customMode) {
					const n = Number(this.customAmount)
					return Number.isFinite(n) ? n : 0
				}
				return Number(this.selectedPreset || 0)
			},
			canPay() {
				return this.payAmount >= MIN_RECHARGE_AMOUNT
			}
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			const phone = await ensurePhoneBound({ required: true })
			if (!phone?.bound) return
			await this.loadMine()
		},
		methods: {
			formatMemberBalance,
			resolveStoreId() {
				return resolveViewStoreId(isLoggedIn() ? getUserInfo() : null)
			},
			async loadMine() {
				try {
					const data = await getStoreMemberMineApi(this.resolveStoreId())
					this.memberInfo = {
						member: !!data?.member,
						balance: Number(data?.balance || 0),
						storeId: data?.storeId ? String(data.storeId) : this.resolveStoreId()
					}
				} catch (error) {
					console.error('加载会员信息失败', error)
				}
			},
			selectPreset(amount) {
				this.customMode = false
				this.selectedPreset = amount
				this.customAmount = ''
			},
			enableCustom() {
				this.customMode = true
				this.selectedPreset = 0
			},
			onCustomInput(event) {
				this.customAmount = String(event?.detail?.value || '').replace(/[^\d.]/g, '')
			},
			async handlePay() {
				if (this.paying) return
				if (!this.canPay) {
					uni.showToast({
						title: `每次储值至少${MIN_RECHARGE_AMOUNT}元`,
						icon: 'none'
					})
					return
				}
				this.paying = true
				try {
					const payParams = await rechargeStoreMemberApi({
						storeId: this.resolveStoreId(),
						amount: this.payAmount
					})
					const rechargeNo = payParams?.orderNo
					if (!rechargeNo) {
						throw new Error('下单失败：未返回单号')
					}
					if (payParams.mock) {
						await mockConfirmStoreMemberRechargeApi(rechargeNo)
					} else {
						try {
							await requestStoreMemberRechargePay(payParams)
						} catch (err) {
							const msg = err?.errMsg || ''
							if (msg.includes('cancel') || msg.includes('取消')) {
								uni.showToast({ title: '已取消支付', icon: 'none' })
								return
							}
							throw err instanceof Error ? err : new Error(msg || '支付失败')
						}
						const result = await waitStoreMemberRechargePaid(rechargeNo)
						if (Number(result?.recharge?.payStatus) !== 1) {
							uni.showToast({
								title: '支付结果确认中，请稍后查看余额',
								icon: 'none'
							})
							return
						}
					}
					uni.showToast({ title: '储值成功', icon: 'success' })
					await this.loadMine()
					setTimeout(() => {
						uni.navigateBack()
					}, 1200)
				} catch (error) {
					console.error('储值失败', error)
					uni.showToast({
						title: error?.message || '储值失败',
						icon: 'none'
					})
				} finally {
					this.paying = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.recharge-page {
		min-height: 100vh;
		background-color: #f5f6f8;
		padding: 24rpx 24rpx 180rpx;
		box-sizing: border-box;
	}

	.balance-card,
	.preset-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 32rpx 28rpx;
		margin-bottom: 20rpx;
	}

	.balance-label {
		font-size: 26rpx;
		color: #888;
	}

	.balance-value {
		display: flex;
		align-items: baseline;
		margin-top: 12rpx;
	}

	.currency {
		font-size: 32rpx;
		color: #00a896;
		font-weight: 600;
	}

	.amount {
		font-size: 56rpx;
		color: #00a896;
		font-weight: 700;
		margin-left: 4rpx;
	}

	.balance-tip {
		display: block;
		margin-top: 12rpx;
		font-size: 22rpx;
		color: #aaa;
	}

	.card-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		margin-top: 24rpx;
	}

	.preset-item {
		height: 112rpx;
		border-radius: 12rpx;
		border: 2rpx solid #eee;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fafafa;
		box-sizing: border-box;
	}

	.preset-item.active {
		border-color: #00a896;
		background: rgba(0, 168, 150, 0.08);
	}

	.preset-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.preset-amount {
		font-size: 40rpx;
		font-weight: 700;
		color: #333;
		line-height: 1;
	}

	.preset-amount.custom {
		font-size: 30rpx;
		font-weight: 600;
		line-height: 1;
	}

	.preset-unit {
		margin-left: 6rpx;
		font-size: 24rpx;
		color: #888;
		line-height: 1;
	}

	.custom-row {
		display: flex;
		align-items: center;
		margin-top: 24rpx;
		padding: 0 20rpx;
		height: 88rpx;
		border: 2rpx solid #eee;
		border-radius: 12rpx;
	}

	.custom-prefix {
		font-size: 32rpx;
		color: #00a896;
		font-weight: 600;
	}

	.custom-input {
		flex: 1;
		margin-left: 12rpx;
		font-size: 32rpx;
		color: #333;
	}

	.submit-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 120rpx;
		padding: 0 24rpx;
		padding-bottom: env(safe-area-inset-bottom);
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.submit-label {
		font-size: 24rpx;
		color: #888;
		margin-right: 8rpx;
	}

	.submit-amount {
		font-size: 36rpx;
		font-weight: 700;
		color: #00a896;
	}

	.submit-btn {
		min-width: 240rpx;
		height: 80rpx;
		border-radius: 40rpx;
		background: #00a896;
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-btn.disabled {
		opacity: 0.45;
	}
</style>
