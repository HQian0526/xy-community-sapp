<template>
	<view class="other-business-page">
		<view class="store-banner">
			<image class="store-avatar" :src="storeInfo.avatar" mode="aspectFill" />
			<view class="store-info">
				<text class="store-name">{{ storeInfo.storeName }}</text>
				<text class="store-tip">以下为本店提供的其他业务服务</text>
			</view>
		</view>

		<view v-if="businessList.length" class="business-list">
			<view v-for="item in businessList" :key="item.id" class="business-card">
				<view class="card-main">
					<view class="business-icon">
						<up-icon name="grid" size="22" color="#00a896"></up-icon>
					</view>
					<view class="business-content">
						<text class="business-name">{{ item.name }}</text>
						<text v-if="item.description" class="business-desc">{{ item.description }}</text>
						<text class="business-fee">收费标准：{{ item.fee }}</text>
					</view>
				</view>
				<view class="card-footer">
					<text class="action-btn btn-success" @click="openPayPopup(item)">直接支付</text>
					<text class="action-btn btn-success-plain" @click="handleContact">联系店家</text>
				</view>
			</view>
			<view class="list-footer">已经到底了～</view>
		</view>

		<view v-else class="empty-wrap">
			<u-empty text="店家暂未发布其他业务" mode="list"></u-empty>
		</view>

		<view class="pay-popup-host">
			<u-popup :show="payPopupShow" mode="bottom" round="16" closeOnClickOverlay @close="closePayPopup">
				<view v-if="currentItem" class="pay-popup">
					<view class="pay-popup-header">
						<text class="pay-popup-title">业务详情</text>
					</view>

					<view class="pay-detail">
						<text class="pay-name">{{ currentItem.name }}</text>
						<text v-if="currentItem.description" class="pay-desc">{{ currentItem.description }}</text>
						<text class="pay-fee">收费标准：{{ currentItem.fee }}</text>
						<text class="pay-unit-price">单价：¥{{ formatMoney(unitPrice) }}</text>
					</view>

					<view class="pay-count-row">
						<text class="pay-count-label">购买数量</text>
						<view class="pay-stepper">
							<view class="stepper-btn" @click="changeCount(-1)">
								<up-icon name="minus" size="12" color="#666"></up-icon>
							</view>
							<text class="stepper-count">{{ payCount }}</text>
							<view class="stepper-btn stepper-btn--plus" @click="changeCount(1)">
								<up-icon name="plus" size="12" color="#fff"></up-icon>
							</view>
						</view>
					</view>

					<view class="pay-total-row">
						<text class="pay-total-label">应付金额</text>
						<text class="pay-total-value">¥{{ formatMoney(payTotal) }}</text>
					</view>

					<view class="pay-popup-footer">
						<view class="btn-success pay-submit-btn" @click="handleConfirmPay">确认支付</view>
					</view>
				</view>
			</u-popup>
		</view>
	</view>
</template>

<script>
	import { getOtherBusinessList } from '../personalCenter/otherBusinessSetting/mock.js'
	import { getStoreProfile } from '../personalCenter/storeProfile/mock.js'
	import { storeInfo as defaultStoreInfo } from '../personalCenter/mock.js'
	import { parseBusinessUnitPrice, formatMoney } from './mock.js'

	export default {
		data() {
			return {
				storeInfo: {
					...defaultStoreInfo
				},
				businessList: [],
				payPopupShow: false,
				currentItem: null,
				payCount: 1,
				paying: false
			}
		},
		computed: {
			unitPrice() {
				if (!this.currentItem) return 0
				return parseBusinessUnitPrice(this.currentItem.fee)
			},
			payTotal() {
				return this.unitPrice * this.payCount
			}
		},
		onShow() {
			this.loadPageData()
		},
		onPullDownRefresh() {
			this.loadPageData()
			uni.stopPullDownRefresh()
		},
		methods: {
			formatMoney,
			loadPageData() {
				const profile = getStoreProfile()
				this.storeInfo = {
					...defaultStoreInfo,
					storeName: profile.storeName,
					avatar: profile.storePhoto || defaultStoreInfo.avatar,
					phone: profile.phone
				}
				this.businessList = getOtherBusinessList()
			},
			openPayPopup(item) {
				this.currentItem = item
				this.payCount = 1
				this.payPopupShow = true
			},
			closePayPopup() {
				this.payPopupShow = false
				this.currentItem = null
				this.payCount = 1
				this.paying = false
			},
			changeCount(delta) {
				const next = this.payCount + delta
				if (next < 1) return
				if (next > 99) return
				this.payCount = next
			},
			handleConfirmPay() {
				if (!this.currentItem || this.paying) return
				if (this.unitPrice <= 0) {
					uni.showToast({
						title: '无法识别收费标准，请联系店家',
						icon: 'none'
					})
					return
				}

				this.paying = true
			},
			handleContact() {
				uni.navigateTo({
					url: '/pages/personalCenter/contactService/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.other-business-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.store-banner {
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.store-avatar {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		flex-shrink: 0;
		background-color: #f5f5f5;
	}

	.store-info {
		flex: 1;
		min-width: 0;
		margin-left: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.store-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.store-tip {
		font-size: 24rpx;
		color: #999;
	}

	.business-list {
		padding-bottom: 24rpx;
	}

	.business-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.card-main {
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
	}

	.business-icon {
		flex-shrink: 0;
		width: 72rpx;
		height: 72rpx;
		border-radius: 12rpx;
		background-color: rgba(0, 168, 150, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.business-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.business-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.business-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}

	.business-fee {
		font-size: 26rpx;
		color: #ff6034;
		font-weight: 500;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 16rpx;
		margin-top: 24rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.action-btn {
		font-size: 26rpx;
		padding: 10rpx 28rpx;
	}

	.pay-popup-host {
		position: fixed;
		left: 0;
		top: 0;
		width: 0;
		height: 0;
		overflow: visible;
		z-index: 1000;
	}

	.pay-popup {
		background-color: #fff;
		border-radius: 16rpx 16rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.pay-popup-header {
		padding: 28rpx 32rpx 16rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.pay-popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.pay-detail {
		padding: 24rpx 32rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.pay-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.pay-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}

	.pay-fee,
	.pay-unit-price {
		font-size: 26rpx;
		color: #999;
	}

	.pay-unit-price {
		color: #ff6034;
		font-weight: 500;
	}

	.pay-count-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 32rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.pay-count-label {
		font-size: 28rpx;
		color: #333;
	}

	.pay-stepper {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.stepper-btn {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		border: 1rpx solid #ddd;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
	}

	.stepper-btn--plus {
		background-color: $primary;
		border-color: $primary;
	}

	.stepper-count {
		min-width: 32rpx;
		text-align: center;
		font-size: 28rpx;
		color: #333;
	}

	.pay-total-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding: 0 32rpx 24rpx;
	}

	.pay-total-label {
		font-size: 28rpx;
		color: #666;
	}

	.pay-total-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #ff6034;
	}

	.pay-popup-footer {
		padding: 16rpx 32rpx 24rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.pay-submit-btn {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: 600;
	}

	.list-footer {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		padding: 24rpx 0;
	}

	.empty-wrap {
		padding-top: 160rpx;
	}
</style>
