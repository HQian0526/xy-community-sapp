<template>
	<view class="personal-page">
		<view class="header-bg"></view>

		<view class="profile-section">
			<view class="avatar-wrap">
				<image class="avatar-img" :src="storeInfo.avatar" mode="aspectFill" />
			</view>
			<view class="profile-info">
				<text class="store-name">{{ storeInfo.storeName }}</text>
				<text class="store-phone">{{ storeInfo.phone }}</text>
			</view>
			<text class="store-status">{{ storeInfo.status }}</text>
		</view>

		<view class="content-wrap">
			<view class="account-card">
				<view class="card-header">
					<text class="card-title">账户总览</text>
					<view style="display: flex" @click="goAccountOverview">
						<text class="cash">去提现</text>
						<up-icon name="arrow-right" size="10" color="#999"></up-icon>
					</view>
				</view>
				<view class="account-row">
					<view class="account-item">
						<text class="account-label">我的钱包</text>
						<view class="account-value">
							<text class="currency">¥</text>
							<text class="amount">{{ formatMoney(storeInfo.totalAssets) }}</text>
						</view>
					</view>
					<view class="account-item account-item-right">
						<text class="account-label">今日收入</text>
						<view class="account-value">
							<text class="currency">¥</text>
							<text class="amount">{{ formatMoney(storeInfo.yesterdayIncome) }}</text>
						</view>
					</view>
				</view>
				<up-grid :col="4" :border="false">
					<up-grid-item v-for="item in accountList" :key="item.key" :name="item.key"
						@click="handleServiceClick(item)">
						<view class="service-item">
							<view class="service-icon-square">
								<up-icon :name="item.icon" size="28" color="#00a896"></up-icon>
							</view>
							<view class="service-name">
								{{ item.name }}
								<up-badge v-if="item.name === '待处理'" class="badge" max="99"
									:value="badgeCount"></up-badge>
							</view>

						</view>
					</up-grid-item>
				</up-grid>
			</view>

			<view class="service-card">
				<text class="section-title">基础服务</text>
				<up-grid :col="4" :border="false">
					<up-grid-item v-for="item in serviceList" :key="item.key" :name="item.key"
						@click="handleServiceClick(item)">
						<view class="service-item">
							<view class="service-icon-wrap">
								<up-icon :name="item.icon" size="28" color="#00a896"></up-icon>
							</view>
							<text class="service-name">{{ item.name }}</text>
						</view>
					</up-grid-item>
				</up-grid>
			</view>

			<view class="service-card">
				<text class="section-title">商家服务</text>
				<up-grid :col="4" :border="false">
					<up-grid-item v-for="item in ownerList" :key="item.key" :name="item.key"
						@click="handleServiceClick(item)">
						<view class="service-item">
							<view class="service-icon-wrap">
								<up-icon :name="item.icon" size="28" color="#00a896"></up-icon>
							</view>
							<text class="service-name">{{ item.name }}</text>
						</view>
					</up-grid-item>
				</up-grid>
			</view>
		</view>
		<view class="flex-center invite" @click="goJoinApply">想在您的区域引入并经营此小程序？点此申请</view>
	</view>
</template>

<script>
	import {
		storeInfo,
		accountList,
		serviceList,
		ownerList
	} from './mock.js'
	import {
		getBusinessStatus
	} from './businessStatus/mock.js'
	import {
		getWalletBalance
	} from './withdraw/mock.js'
	import {
		getPendingCount
	} from './pending/mock.js'

	export default {
		data() {
			return {
				storeInfo: {
					...storeInfo
				},
				accountList,
				serviceList,
				ownerList,
				badgeCount: 0,
			}
		},
		onShow() {
			this.loadStoreStatus()
			this.loadWalletBalance()
			this.loadPendingCount()
		},
		methods: {
			loadStoreStatus() {
				this.storeInfo.status = getBusinessStatus()
			},
			loadWalletBalance() {
				this.storeInfo.totalAssets = getWalletBalance()
			},
			loadPendingCount() {
				this.badgeCount = getPendingCount()
			},
			formatMoney(value) {
				return Number(value).toFixed(2)
			},
			goAccountOverview() {
				uni.navigateTo({
					url: '/pages/personalCenter/withdraw/index',
				})
			},
			handleServiceClick(item) {
				if (item.url) {
					uni.navigateTo({
						url: item.url,
					})
					return
				}
				uni.showToast({
					title: item ? item.name : '功能开发中',
					icon: 'none'
				})
			},
			goJoinApply() {
				uni.navigateTo({
					url: '/pages/join/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.personal-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
	}

	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 320rpx;
		background: linear-gradient(180deg, #e8f8f6 0%, #f2fbfb 60%, #f5f5f5 100%);
	}

	.profile-section {
		position: relative;
		display: flex;
		align-items: center;
		padding: 32rpx 32rpx 24rpx;
	}

	.avatar-wrap {
		flex-shrink: 0;
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		overflow: hidden;
		background: linear-gradient(135deg, $primary 0%, #33b9ab 100%);
		padding: 4rpx;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: #fff;
	}

	.profile-info {
		flex: 1;
		min-width: 0;
		margin-left: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.store-name {
		font-size: 34rpx;
		font-weight: 700;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.store-phone {
		font-size: 26rpx;
		color: #999;
	}

	.store-status {
		flex-shrink: 0;
		font-size: 26rpx;
		color: $primary;
		font-weight: 500;
	}

	.content-wrap {
		position: relative;
		padding: 0 24rpx;
	}

	.account-card,
	.service-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 28rpx;
	}

	.card-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		padding-left: 16rpx;
		border-left: 6rpx solid $primary;
	}

	.account-row {
		display: flex;
		align-items: flex-start;
	}

	.account-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		margin-left: 40rpx;
	}

	.account-item-right {
		// padding-left: 40rpx;
	}

	.account-label {
		font-size: 24rpx;
		color: #999;
	}

	.account-value {
		display: flex;
		align-items: baseline;
	}

	.currency {
		font-size: 28rpx;
		font-weight: 600;
		color: $primary;
		margin-right: 4rpx;
	}

	.amount {
		font-size: 44rpx;
		font-weight: 700;
		color: $primary;
		line-height: 1;
	}

	.cash {
		color: #999;
		font-size: 24rpx;
	}

	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
		padding-left: 16rpx;
		border-left: 6rpx solid $primary;
	}

	.service-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 0;
	}

	.service-icon-square {
		width: 90rpx;
		height: 90rpx;
		border-radius: 10rpx;
		background-color: rgba(0, 168, 150, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12rpx;
	}

	.service-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: rgba(0, 168, 150, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12rpx;
	}

	.service-name {
		font-size: 24rpx;
		color: #333;
		text-align: center;
		line-height: 1.3;
		position: relative;
	}

	.badge {
		position: absolute;
		top: 0;
		right: -35rpx;
	}

	.invite {
		color: #1179ff;
		font-size: 24rpx;
		text-decoration: underline;
	}
</style>