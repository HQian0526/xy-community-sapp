<template>
	<view class="personal-page">
		<view class="header-bg"></view>

		<view class="profile-section">
			<view class="avatar-wrap" @click="onHeaderTap">
				<image class="avatar-img" :src="headerAvatar" mode="aspectFill" />
			</view>
			<view class="profile-info" @click="onHeaderTap">
				<text class="store-name">{{ headerName }}</text>
				<text class="store-phone">{{ headerPhone }}</text>
			</view>
			<text
				v-if="!loggedIn"
				class="login-entry"
				@click="handleLogin"
			>{{ loginLoading ? '登录中...' : '登录' }}</text>
			<text
				v-else-if="showBindPhoneEntry"
				class="login-entry"
				@click="handleBindPhone"
			>{{ loginLoading ? '授权中...' : '授权手机号' }}</text>
			<text
				v-else-if="isMerchant"
				class="store-status"
				:class="{ 'store-status--closed': isPaused }"
				@click="goBusinessStatus"
			>{{ storeInfo.status }}</text>
		</view>

		<view class="content-wrap">
			<!-- 商家端 identityType === 2 -->
			<template v-if="isMerchant">
				<view class="account-card">
					<view class="card-header">
						<text class="card-title">订单管理</text>
					</view>
					<view class="account-row">
						<view class="account-item">
							<text class="account-label">待结算金额</text>
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
						<up-grid-item v-for="item in businessList" :key="item.key" :name="item.key"
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
			</template>

			<!-- 个人用户 identityType === 1 -->
			<template v-else>
				<view class="account-card">
					<view class="card-header">
						<text class="card-title">我的订单</text>
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
									<up-badge v-if="item.name === '进行中'" class="badge" max="99"
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
			</template>
		</view>

		<view class="flex-center invite" @click="goJoinApply">想在您的区域引入并经营此小程序？点此申请</view>

		<!-- #ifdef MP-WEIXIN -->
		<u-popup :show="sharePopupShow" mode="center" round="16" closeOnClickOverlay @close="closeSharePopup">
			<view class="share-popup">
				<text class="share-popup-title">分享小程序</text>
				<!-- <text class="share-popup-desc">邀请好友一起使用</text> -->
				<button class="share-popup-btn" open-type="share" @click="closeSharePopup">分享给微信好友</button>
			</view>
		</u-popup>
		<!-- #endif -->
		<bind-phone-popup ref="bindPhonePopup" />
	</view>
</template>

<script>
	import {
		storeInfo,
		accountList,
		serviceList,
		ownerList,
		businessList
	} from './mock.js'
	import {
		STATUS_CLOSED
	} from './businessStatus/mock.js'
	import {
		getWalletBalance
	} from './withdraw/mock.js'
	import {
		getPendingCount
	} from './pending/mock.js'
	import {
		DEFAULT_SHARE
	} from '@/common/share/config.js'
	import {
		requireLogin,
		isLoggedIn,
		waitBootstrapAuth,
		ensureUserInfo,
		ensurePhoneBound,
		isNeedBindPhone
	} from '@/common/auth.js'
	import {
		getStoreListApi,
		getStoreStatusLabel,
		isStoreClosed
	} from '@/common/api/personalCenter/store.js'
	import {
		resolveFileUrl
	} from '@/common/api/config.js'
	import {
		applyLaunchQuery,
		shouldForceOrdinaryUi,
		setOwnMerchantStoreId
	} from '@/common/storeVisit.js'
	import bindPhoneMixin from '@/common/mixin/bindPhoneMixin.js'
	import BindPhonePopup from '@/components/bind-phone-popup/bind-phone-popup.vue'

	const DEFAULT_AVATAR = storeInfo.avatar
	const IDENTITY_USER = 1
	const IDENTITY_MERCHANT = 2

	export default {
		mixins: [bindPhoneMixin],
		components: {
			BindPhonePopup
		},
		data() {
			return {
				storeInfo: {
					...storeInfo
				},
				userProfile: {
					id: null,
					realName: '',
					phone: '',
					avatar: '',
					identityType: IDENTITY_USER
				},
				storeProfile: {
					id: null,
					storeId: null,
					storeName: '',
					avatar: '',
					storeStatus: null
				},
				accountList,
				serviceList,
				ownerList,
				businessList,
				badgeCount: 0,
				sharePopupShow: false,
				userLoading: false,
				loginLoading: false,
				hasLogin: false,
			}
		},
		computed: {
			loggedIn() {
				return this.hasLogin
			},
			isMerchant() {
				return Number(this.userProfile.identityType) === IDENTITY_MERCHANT
					&& !shouldForceOrdinaryUi(this.userProfile)
			},
			showBindPhoneEntry() {
				return this.loggedIn && !this.isMerchant && isNeedBindPhone(this.userProfile)
			},
			isPaused() {
				if (this.storeProfile.storeStatus != null) {
					return isStoreClosed(this.storeProfile.storeStatus)
				}
				return this.storeInfo.status === STATUS_CLOSED
			},
			headerName() {
				if (!this.loggedIn) return '游客'
				if (this.isMerchant) {
					return this.storeProfile.storeName || this.storeInfo.storeName || '我的店铺'
				}
				return this.userProfile.realName || '微信用户'
			},
			headerPhone() {
				if (!this.loggedIn) return '登录后查看订单与资料'
				const phone = String(this.userProfile.phone || '').trim()
				if (!phone) return '未绑定手机号'
				if (phone.length < 7) return phone
				return `${phone.slice(0, 3)}****${phone.slice(-4)}`
			},
			headerAvatar() {
				if (this.isMerchant) {
					return this.storeProfile.avatar || this.storeInfo.avatar || DEFAULT_AVATAR
				}
				return this.userProfile.avatar || DEFAULT_AVATAR
			}
		},
		onLoad(options = {}) {
			applyLaunchQuery(options)
		},
		async onShow() {
			applyLaunchQuery()
			await waitBootstrapAuth()
			await this.initUserProfile()
			if (this.isMerchant) {
				this.loadWalletBalance()
			}
			this.loadPendingCount()
		},
		methods: {
			async initUserProfile() {
				if (this.userLoading) return
				this.userLoading = true
				try {
					if (!isLoggedIn()) {
						this.resetGuestProfile()
						return
					}
					this.hasLogin = true
					await this.fetchUserInfo()
					if (Number(this.userProfile.identityType) === IDENTITY_MERCHANT && this.userProfile.id) {
						await this.fetchStoreInfo(this.userProfile.id)
					} else {
						this.storeProfile = {
							id: null,
							storeId: null,
							storeName: '',
							avatar: '',
							storeStatus: null
						}
					}
				} finally {
					this.userLoading = false
				}
			},
			async fetchUserInfo() {
				try {
					const user = await ensureUserInfo()
					if (!user) return
					this.userProfile = {
						id: user.id,
						realName: user.realName || '',
						phone: user.phone || '',
						avatar: resolveFileUrl(user.avatar || ''),
						identityType: user.identityType == null ? IDENTITY_USER : Number(user.identityType)
					}
				} catch (error) {
					console.error('获取用户信息失败', error)
				}
			},
			async fetchStoreInfo(userId) {
				try {
					const data = await getStoreListApi({
						userId
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const store = list[0]
					if (!store) {
						this.storeProfile = {
							id: null,
							storeId: null,
							storeName: '',
							avatar: '',
							storeStatus: null
						}
						return
					}
					this.storeProfile = {
						id: store.id || null,
						storeId: store.storeId || null,
						storeName: store.storeName || '',
						avatar: resolveFileUrl(store.avatar || ''),
						storeStatus: store.storeStatus == null ? null : Number(store.storeStatus)
					}
					if (store.storeId) {
						setOwnMerchantStoreId(store.storeId)
					}
					this.storeInfo.storeName = this.storeProfile.storeName || this.storeInfo.storeName
					this.storeInfo.status = getStoreStatusLabel(this.storeProfile.storeStatus)
					if (this.storeProfile.avatar) {
						this.storeInfo.avatar = this.storeProfile.avatar
					}
				} catch (error) {
					console.error('获取商户信息失败', error)
				}
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
			resetGuestProfile() {
				this.hasLogin = false
				this.userProfile = {
					id: null,
					realName: '',
					phone: '',
					avatar: '',
					identityType: IDENTITY_USER
				}
				this.storeProfile = {
					id: null,
					storeId: null,
					storeName: '',
					avatar: '',
					storeStatus: null
				}
			},
			async handleLogin() {
				if (this.loginLoading) return
				this.loginLoading = true
				try {
					const ok = await requireLogin({ force: true })
					if (!ok) return
					this.hasLogin = true
					this.userLoading = false
					await this.initUserProfile()
				} finally {
					this.loginLoading = false
				}
			},
			async handleBindPhone() {
				if (this.loginLoading) return
				this.loginLoading = true
				try {
					if (!(await requireLogin({ force: true }))) return
					await ensurePhoneBound({ required: true })
					await this.fetchUserInfo()
				} finally {
					this.loginLoading = false
				}
			},
			async ensureOrdinaryUserPhone() {
				if (!(await requireLogin({ force: true }))) return false
				await this.fetchUserInfo()
				this.hasLogin = true
				if (Number(this.userProfile.identityType) === IDENTITY_MERCHANT) {
					return true
				}
				const phoneResult = await ensurePhoneBound({ required: true })
				if (!phoneResult.bound) {
					uni.showToast({
						title: '请先授权手机号',
						icon: 'none'
					})
					return false
				}
				await this.fetchUserInfo()
				return true
			},
			onHeaderTap() {
				if (!this.loggedIn) {
					this.handleLogin()
					return
				}
				if (this.showBindPhoneEntry) {
					this.handleBindPhone()
					return
				}
				this.goStoreProfile()
			},
			isPublicService(item) {
				const url = item?.url || ''
				return url.indexOf('/personAgreement/') !== -1
					|| url.indexOf('/businessAgreement/') !== -1
			},
			async handleServiceClick(item) {
				if (this.isPublicService(item)) {
					if (item.url) {
						uni.navigateTo({ url: item.url })
					}
					return
				}
				if (!(await this.ensureOrdinaryUserPhone())) return
				if (item.key === 'share') {
					this.handleShareMiniProgram()
					return
				}
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
			async goJoinApply() {
				if (!(await this.ensureOrdinaryUserPhone())) return
				uni.navigateTo({
					url: '/pages/join/index'
				})
			},
			goStoreProfile() {
				if (!this.isMerchant) return
				uni.navigateTo({
					url: '/pages/personalCenter/storeProfile/index'
				})
			},
			async goBusinessStatus() {
				if (!this.isMerchant) return
				if (!(await requireLogin({ force: true }))) return
				uni.navigateTo({
					url: '/pages/personalCenter/businessStatus/index'
				})
			},
			handleShareMiniProgram() {
				// #ifdef MP-WEIXIN
				this.shareConfig = {
					title: DEFAULT_SHARE.title,
					path: '/pages/personalCenter/index',
					imageUrl: DEFAULT_SHARE.imageUrl
				}
				this.sharePopupShow = true
				// #endif
				// #ifndef MP-WEIXIN
				uni.showToast({
					title: '请在微信小程序中使用分享',
					icon: 'none'
				})
				// #endif
			},
			closeSharePopup() {
				this.sharePopupShow = false
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

		&--closed {
			color: #999;
		}
	}

	.login-entry {
		flex-shrink: 0;
		padding: 10rpx 28rpx;
		border-radius: 28rpx;
		background-color: $primary;
		color: #fff;
		font-size: 24rpx;
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

	.share-popup {
		width: 560rpx;
		padding: 48rpx 40rpx 40rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.share-popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.share-popup-desc {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #999;
		text-align: center;
		line-height: 1.5;
	}

	.share-popup-btn {
		margin-top: 40rpx;
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #00a896;
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
		border-radius: 44rpx;
		border: none;
		padding: 0;
	}

	.share-popup-btn::after {
		border: none;
	}
</style>