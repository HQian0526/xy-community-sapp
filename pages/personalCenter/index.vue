<template>
	<view class="personal-page">
		<view class="header-bg"></view>

		<view v-if="pageLoading" class="page-loading">
			<up-loading-icon color="#00a896"></up-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>
		<template v-else>
		<view v-if="showRentExpireNotice" class="rent-notice-wrap">
			<up-notice-bar
				:text="rentExpireNoticeText"
				direction="row"
				icon="volume"
			></up-notice-bar>
		</view>
		<view class="profile-section">
			<view class="avatar-wrap" @click="onHeaderTap">
				<image class="avatar-img" :src="headerAvatar" mode="aspectFill" />
			</view>
			<view class="profile-info" @click="onHeaderTap">
				<view class="name-row">
					<text class="store-name">{{ headerName }}</text>
					<view v-if="showHeaderBadges" class="badge-group">
						<text v-if="showOwnerBadge" class="owner-badge">店长</text>
						<text v-if="showStaffBadge" class="staff-badge">店员</text>
						<text v-if="showVipBadge" class="vip-badge">VIP</text>
					</view>
				</view>
				<text class="store-phone">{{ headerPhone }}</text>
			</view>
			<text
				v-if="!loggedIn"
				class="login-entry"
				@click="handleLogin"
			>{{ loginLoading ? '登录中...' : '登录' }}</text>
			<text
				v-else-if="showSwitchOwnStore"
				class="login-entry switch-own-store"
				@click.stop="handleSwitchToOwnStore"
			>切换至我的店铺</text>
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
			<text
				v-else-if="showMemberEntry"
				class="member-entry"
				@click="goRecharge"
			>{{ memberEntryText }}</text>
		</view>
		<view
			v-if="showOwnedStoreSwitcher"
			class="owned-store-switch"
			@click="handleSwitchOwnedStore"
		>
			<text class="owned-store-label">当前门店</text>
			<text class="owned-store-name">{{ currentOwnedStoreName }}</text>
			<text class="owned-store-arrow">切换</text>
		</view>

		<view class="content-wrap">
			<!-- 商家端 identityType === 2 -->
			<template v-if="isMerchant">
				<view class="account-card">
					<view class="card-header">
						<text class="card-title">订单管理</text>
						<text v-if="storeInfo.platformCollect" class="header-recharge" @click.stop="goStoreRecharge">去储值</text>
					</view>
					<view class="account-row" :class="{ 'account-row-grid': storeInfo.platformCollect }">
						<view v-if="storeInfo.platformCollect" class="account-item">
							<view class="account-label-row">
								<text class="account-label">店铺余额</text>
								<view class="settle-help" @click.stop="openSettleTip">
									<text class="settle-help-mark">?</text>
								</view>
							</view>
							<view class="account-value">
								<text class="currency">¥</text>
								<text class="amount">{{ formatMoney(storeInfo.pendingAmount) }}</text>
							</view>
						</view>
						<view class="account-item">
							<text class="account-label">本月销售额</text>
							<view class="account-value">
								<text class="currency">¥</text>
								<text class="amount">{{ formatMoney(storeInfo.monthSales) }}</text>
							</view>
						</view>
						<view class="account-item">
							<text class="account-label">今日收入</text>
							<view class="account-value">
								<text class="currency">¥</text>
								<text class="amount">{{ formatMoney(storeInfo.todayIncome) }}</text>
							</view>
						</view>
					</view>
					<up-grid :col="4" :border="false">
						<up-grid-item v-for="item in displayBusinessList" :key="item.key" :name="item.key"
							@click="handleServiceClick(item)">
							<view class="service-item">
								<view class="service-icon-square">
									<up-icon :name="item.icon" size="28" color="#00a896"></up-icon>
								</view>
								<view class="service-name">
									{{ item.name }}
								</view>
							</view>
						</up-grid-item>
					</up-grid>
				</view>

				<view class="service-card">
					<text class="section-title">商家服务</text>
					<up-grid :col="4" :border="false">
						<up-grid-item v-for="item in displayOwnerList" :key="item.key" :name="item.key"
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
						<up-grid-item v-for="item in displayAccountList" :key="item.key" :name="item.key"
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
			</template>

			<view class="service-card">
				<text class="section-title">基础服务</text>
				<up-grid :col="4" :border="false">
					<up-grid-item v-for="item in displayServiceList" :key="item.key" :name="item.key"
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

			<view v-if="showStaffPrivilege" class="service-card staff-card">
				<text class="section-title staff-section-title">员工特权</text>
				<up-grid :col="4" :border="false">
					<up-grid-item v-for="item in staffPrivilegeList" :key="item.key" :name="item.key"
						@click="handleServiceClick(item)">
						<view class="service-item">
							<view class="service-icon-wrap staff-icon-wrap">
								<up-icon :name="item.icon" size="28" color="#8a5a12"></up-icon>
							</view>
							<text class="service-name">{{ item.name }}</text>
						</view>
					</up-grid-item>
				</up-grid>
			</view>
		</view>

		<view class="invite" @click="goJoinApply">想为您的店铺引入小程序？点此申请</view>
		</template>

		<!-- #ifdef MP-WEIXIN -->
		<u-popup :show="sharePopupShow" mode="center" round="16" closeOnClickOverlay @close="closeSharePopup">
			<view class="share-popup">
				<text class="share-popup-title">分享小程序</text>
				<!-- <text class="share-popup-desc">邀请好友一起使用</text> -->
				<button class="share-popup-btn" open-type="share" @click="closeSharePopup">分享给微信好友</button>
			</view>
		</u-popup>
		<!-- #endif -->
		<u-popup
			:show="contactStoreShow"
			mode="bottom"
			round="16"
			closeOnClickOverlay
			@close="closeContactStore"
		>
			<view class="contact-store-popup">
				<view class="contact-store-handle"></view>
				<text class="contact-store-title">联系店家</text>
				<text class="contact-store-name">{{ contactStoreName || '店铺' }}</text>
				<text class="contact-store-phone">{{ contactStorePhone }}</text>
				<view class="contact-store-btn" @click="handleCallStore">拨打电话</view>
			</view>
		</u-popup>
		<u-popup
			:show="settleTipShow"
			mode="center"
			round="16"
			closeOnClickOverlay
			@close="closeSettleTip"
		>
			<view class="settle-tip-popup">
				<text class="settle-tip-title">店铺余额</text>
				<text class="settle-tip-text">店铺余额即待结算金额，每月1日和15日自动结算给商户。</text>
				<text class="settle-tip-text">计算公式：店铺余额 = 用户储值 + 用户直付 − 退款 + 店长储值</text>
				<text class="settle-tip-note">注：接入支付的小程序官方会收取0.6-1%的手续费，具体费率以官方为准，与萤小铺(本小程序)无关，望悉知。</text>
				<view class="settle-tip-btn" @click="closeSettleTip">知道了</view>
			</view>
		</u-popup>
		<bind-phone-popup ref="bindPhonePopup" />
	</view>
</template>

<script>
	import {
		storeInfo,
		accountList,
		serviceList,
		ownerList,
		businessList,
		staffPrivilegeList
	} from './mock.js'
	import {
		getMallPendingCountApi,
		getMallSettlementSummaryApi
	} from '@/common/api/mall/order.js'
	import {
		formatMemberBalance,
		getStoreMemberMineApi
	} from '@/common/api/mall/member.js'
	import {
		DEFAULT_SHARE,
		buildStoreHomeSharePath
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
		getStoreOpenLabel,
		isStorePaused,
		isStoreRentType,
		isStoreSubscriptionExpired,
		parseStoreExpireDate
	} from '@/common/api/personalCenter/store.js'
	import {
		resolveFileUrl
	} from '@/common/api/config.js'
	import { applyStoreMiniappUi, getMiniappUi, mallMiniappUi } from '@/common/miniappUi.js'
	import {
		applyLaunchQuery,
		resolveViewStoreId,
		getBrowsingStoreId,
		shouldForceOrdinaryUi,
		canSwitchToWorkplace,
		isStaffAtOwnStore,
		setOwnMerchantStoreId,
		switchToOwnStore,
		switchOwnedStore,
		applyOwnedWorkplace,
		getOwnMerchantStoreId
	} from '@/common/storeVisit.js'
	import {
		switchStoreApi
	} from '@/common/api/personalCenter/user.js'
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
					identityType: IDENTITY_USER,
					storeExpired: false,
					staffStoreId: '',
					staffStoreExpired: false,
					lastStoreId: '',
					ownedStores: []
				},
				storeProfile: {
					id: null,
					storeId: null,
					storeName: '',
					avatar: '',
					storeStatus: null,
					acceptingOrders: true,
					manuallyClosed: false,
					openStatus: 'open',
					subscriptionExpired: false,
					storeType: null,
					storeTime: ''
				},
				visitStore: {
					storeName: '',
					avatar: ''
				},
				accountList,
				serviceList,
				ownerList,
				businessList,
				staffPrivilegeList,
				badgeCount: 0,
				sharePopupShow: false,
				settleTipShow: false,
				contactStoreShow: false,
				contactStoreName: '',
				contactStorePhone: '',
				contactStoreLoading: false,
				userLoading: false,
				pageLoading: true,
				loginLoading: false,
				hasLogin: false,
				memberInfo: {
					member: false,
					balance: 0
				},
				miniappUi: mallMiniappUi()
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
			showSwitchOwnStore() {
				return this.loggedIn && canSwitchToWorkplace(this.userProfile)
			},
			ownedStores() {
				return Array.isArray(this.userProfile.ownedStores) ? this.userProfile.ownedStores : []
			},
			showOwnedStoreSwitcher() {
				return this.loggedIn && this.isMerchant && this.ownedStores.length > 1
			},
			currentOwnedStoreName() {
				const current = String(this.userProfile.lastStoreId || getOwnMerchantStoreId() || '')
				const hit = this.ownedStores.find((item) => String(item && item.storeId) === current)
				if (hit && hit.storeName) return hit.storeName
				return this.storeProfile.storeName || this.storeInfo.storeName || '我的店铺'
			},
			showStaffBadge() {
				return this.loggedIn && isStaffAtOwnStore(this.userProfile)
			},
			/** 店长（商家账号本人，且在自己店内）：与店员标识同样式 */
			showOwnerBadge() {
				return this.loggedIn && this.isMerchant
			},
			/** 储值会员标识：仅店铺开放储值时展示 */
			showVipBadge() {
				return this.loggedIn && this.rechargeEnabled && this.memberInfo.member
			},
			/** 是否有任一标识需要展示，避免空容器占位 */
			showHeaderBadges() {
				return this.showOwnerBadge || this.showStaffBadge || this.showVipBadge
			},
			showStaffPrivilege() {
				return this.showStaffBadge
					&& this.rechargeEnabled
					&& this.userProfile.staffStoreExpired !== true
			},
			showBindPhoneEntry() {
				return this.loggedIn && !this.isMerchant && isNeedBindPhone(this.userProfile)
			},
			isPaused() {
				return isStorePaused(this.storeProfile)
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
			},
			displayBusinessList() {
				const list = this.businessList || []
				if (!this.rechargeEnabled) {
					return list.filter((item) => item.key !== 'verify')
				}
				return list
			},
			displayAccountList() {
				const list = this.accountList || []
				if (this.miniappUi.enablePay === false || this.miniappUi.showCart === false) {
					return list.filter((item) => item.key !== 'cart')
				}
				return list
			},
			/** 店铺是否开放储值（需已接入支付且开启储值） */
			rechargeEnabled() {
				return this.miniappUi.enablePay !== false && this.miniappUi.enableRecharge !== false
			},
			showMemberEntry() {
				return this.rechargeEnabled
			},
			displayServiceList() {
				const list = this.serviceList || []
				if (this.isMerchant || this.miniappUi.enablePay === false) {
					return list.filter((item) => item.key !== 'coupon')
				}
				return list
			},
			storeExpired() {
				return isStoreSubscriptionExpired(this.storeProfile)
					|| this.userProfile.storeExpired === true
			},
			displayOwnerList() {
				const list = this.ownerList || []
				if (this.storeExpired) {
					return list.filter((item) => item.key === 'help')
				}
				return list
			},
			rentExpireDate() {
				return parseStoreExpireDate(this.storeProfile.storeTime)
			},
			showRentExpireNotice() {
				return this.isMerchant
					&& isStoreRentType(this.storeProfile)
					&& !!this.rentExpireDate
			},
			rentExpireNoticeText() {
				if (this.storeExpired) {
					return `您的店铺已于${this.rentExpireDate}到期，请联系客服开通永久权限`
				}
				return `您的店铺将于${this.rentExpireDate}到期，请联系客服开通永久权限`
			},
			memberEntryText() {
				if (this.memberInfo.member) {
					return `会员余额：¥${formatMemberBalance(this.memberInfo.balance)}`
				}
				return '储值'
			}
		},
		onLoad(options = {}) {
			applyLaunchQuery(options)
		},
		async onShow() {
			applyLaunchQuery()
			this.pageLoading = true
			try {
				await waitBootstrapAuth()
				await this.initUserProfile()
				if (this.isMerchant) {
					await this.loadSettlementSummary()
				}
				await this.loadPendingCount()
				// 店员、店长、普通用户都可能有储值会员身份，统一查询
				if (this.loggedIn) {
					await this.loadMemberInfo()
				}
			} finally {
				this.pageLoading = false
			}
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
							storeStatus: null,
							acceptingOrders: true,
							manuallyClosed: false,
							openStatus: 'open',
							subscriptionExpired: false,
							storeType: null,
							storeTime: ''
						}
					}
					if (!this.isMerchant) {
						await this.fetchVisitStoreInfo(
							getBrowsingStoreId() || resolveViewStoreId(this.userProfile)
						)
					} else {
						this.visitStore = { storeName: '', avatar: '' }
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
						identityType: user.identityType == null ? IDENTITY_USER : Number(user.identityType),
						bindStoreId: user.bindStoreId,
						storeExpired: user.storeExpired === true,
						staffStoreId: user.staffStoreId == null ? '' : String(user.staffStoreId),
						staffStoreExpired: user.staffStoreExpired === true,
						lastStoreId: user.lastStoreId == null ? '' : String(user.lastStoreId),
						ownedStores: Array.isArray(user.ownedStores) ? user.ownedStores : []
					}
					applyOwnedWorkplace(user)
				} catch (error) {
					console.error('获取用户信息失败', error)
				}
			},
			async fetchVisitStoreInfo(storeId) {
				const id = storeId == null ? '' : String(storeId).trim()
				if (!id) {
					this.visitStore = { storeName: '', avatar: '' }
					return
				}
				try {
					const data = await getStoreListApi({
						storeId: id,
						pageNum: 1,
						pageSize: 1
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const store = list[0]
					if (store) {
						this.miniappUi = applyStoreMiniappUi(store)
					} else {
						this.miniappUi = getMiniappUi()
					}
					this.visitStore = {
						storeName: store?.storeName || '',
						avatar: resolveFileUrl(store?.avatar || '')
					}
				} catch (error) {
					console.error('获取当前浏览店铺失败', error)
					this.visitStore = { storeName: '', avatar: '' }
				}
			},
			async fetchStoreInfo(userId) {
				try {
					const data = await getStoreListApi({
						userId
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const targetId = String(this.userProfile.lastStoreId || getOwnMerchantStoreId() || '')
					const store = list.find((item) => String(item && item.storeId) === targetId) || list[0]
					if (!store) {
						this.storeProfile = {
							id: null,
							storeId: null,
							storeName: '',
							avatar: '',
							storeStatus: null,
							acceptingOrders: true,
							manuallyClosed: false,
							openStatus: 'open',
							subscriptionExpired: false,
							storeType: null,
							storeTime: ''
						}
						return
					}
					this.storeProfile = {
						id: store.id || null,
						storeId: store.storeId || null,
						storeName: store.storeName || '',
						avatar: resolveFileUrl(store.avatar || ''),
						storeStatus: store.storeStatus == null ? null : Number(store.storeStatus),
						acceptingOrders: store.acceptingOrders !== false,
						manuallyClosed: store.manuallyClosed === true,
						openStatus: store.openStatus || null,
						subscriptionExpired: store.subscriptionExpired === true,
						storeType: store.storeType == null ? null : Number(store.storeType),
						storeTime: store.storeTime || ''
					}
					if (store.storeId) {
						setOwnMerchantStoreId(store.storeId)
					}
					if (!shouldForceOrdinaryUi(this.userProfile)) {
						this.miniappUi = applyStoreMiniappUi(store)
					}
					this.storeInfo.storeName = this.storeProfile.storeName || this.storeInfo.storeName
					this.storeInfo.status = getStoreOpenLabel(this.storeProfile)
					if (this.storeProfile.avatar) {
						this.storeInfo.avatar = this.storeProfile.avatar
					}
				} catch (error) {
					console.error('获取商户信息失败', error)
				}
			},
			async loadSettlementSummary() {
				try {
					const data = await getMallSettlementSummaryApi()
					this.storeInfo.platformCollect = data?.platformCollect !== false
					this.storeInfo.pendingAmount = Number(data?.pendingAmount || 0)
					this.storeInfo.monthSales = Number(data?.monthSales || 0)
					this.storeInfo.todayIncome = Number(data?.todayIncome || 0)
				} catch (error) {
					console.error('获取结算汇总失败', error)
					this.storeInfo.platformCollect = true
					this.storeInfo.pendingAmount = 0
					this.storeInfo.monthSales = 0
					this.storeInfo.todayIncome = 0
				}
			},
			openSettleTip() {
				this.settleTipShow = true
			},
			closeSettleTip() {
				this.settleTipShow = false
			},
			async loadPendingCount() {
				if (!this.loggedIn) {
					this.badgeCount = 0
					return
				}
				try {
					this.badgeCount = await getMallPendingCountApi()
				} catch (error) {
					console.error('获取进行中订单数量失败', error)
					this.badgeCount = 0
				}
			},
			async loadMemberInfo() {
				if (!this.loggedIn) {
					this.memberInfo = { member: false, balance: 0 }
					return
				}
				try {
					const storeId = resolveViewStoreId(this.userProfile)
					const data = await getStoreMemberMineApi(storeId)
					this.memberInfo = {
						member: !!data?.member,
						balance: Number(data?.balance || 0)
					}
				} catch (error) {
					console.error('获取会员信息失败', error)
					this.memberInfo = { member: false, balance: 0 }
				}
			},
			async goRecharge() {
				if (!this.showMemberEntry) return
				if (!(await this.ensureOrdinaryUserPhone())) return
				uni.navigateTo({
					url: '/pages/personalCenter/recharge/index'
				})
			},
			goStoreRecharge() {
				const storeId = this.storeProfile && this.storeProfile.storeId
				if (!storeId) {
					uni.showToast({ title: '未找到当前店铺', icon: 'none' })
					return
				}
				uni.navigateTo({
					url: `/pages/personalCenter/storeRecharge/index?storeId=${encodeURIComponent(storeId)}`
				})
			},
			formatMoney(value) {
				return Number(value || 0).toFixed(2)
			},
			resetGuestProfile() {
				this.hasLogin = false
				this.badgeCount = 0
				this.memberInfo = { member: false, balance: 0 }
				this.userProfile = {
					id: null,
					realName: '',
					phone: '',
					avatar: '',
					identityType: IDENTITY_USER,
					storeExpired: false,
					staffStoreId: '',
					staffStoreExpired: false,
					lastStoreId: '',
					ownedStores: []
				}
				this.storeProfile = {
					id: null,
					storeId: null,
					storeName: '',
					avatar: '',
					storeStatus: null,
					acceptingOrders: true,
					manuallyClosed: false,
					openStatus: 'open',
					subscriptionExpired: false,
					storeType: null,
					storeTime: ''
				}
				this.storeInfo.platformCollect = true
				this.storeInfo.pendingAmount = 0
				this.storeInfo.monthSales = 0
				this.storeInfo.todayIncome = 0
				this.visitStore = { storeName: '', avatar: '' }
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
					if (this.isMerchant) {
						await this.loadSettlementSummary()
					} else {
						await this.loadMemberInfo()
					}
					await this.loadPendingCount()
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
			async handleSwitchToOwnStore() {
				switchToOwnStore(this.userProfile)
				this.userLoading = false
				await this.initUserProfile()
				if (this.isMerchant) {
					await this.loadSettlementSummary()
				}
				await this.loadPendingCount()
				uni.showToast({
					title: '已切换到我的店铺',
					icon: 'none'
				})
			},
			handleSwitchOwnedStore() {
				const stores = this.ownedStores
				if (stores.length < 2) return
				const itemList = stores.map((item) => {
					const name = (item && item.storeName) || '未命名店铺'
					return item && item.expired ? `${name}（已到期）` : name
				})
				uni.showActionSheet({
					itemList,
					success: async (res) => {
						const target = stores[res.tapIndex]
						const storeId = target && target.storeId != null ? String(target.storeId) : ''
						if (!storeId || storeId === String(this.userProfile.lastStoreId || '')) {
							return
						}
						uni.showLoading({ title: '切换中', mask: true })
						try {
							await switchStoreApi(storeId)
							switchOwnedStore(storeId)
							await ensureUserInfo({ force: true })
							this.userLoading = false
							await this.initUserProfile()
							if (this.isMerchant) {
								await this.loadSettlementSummary()
							}
							await this.loadPendingCount()
							uni.showToast({
								title: '已切换门店',
								icon: 'none'
							})
						} catch (error) {
							console.error('切换门店失败', error)
						} finally {
							uni.hideLoading()
						}
					}
				})
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
				if (this.storeExpired) return
				this.goStoreProfile()
			},
			isTabService(item) {
				const url = item?.url || ''
				return item?.key === 'storeOrder'
					|| url.indexOf('/storeOrder/') !== -1
			},
			isPublicService(item) {
				const url = item?.url || ''
				return item?.key === 'cart'
					|| url.indexOf('/mall/cart/') !== -1
					|| url.indexOf('/personAgreement/') !== -1
					|| url.indexOf('/businessAgreement/') !== -1
			},
			isProfileService(item) {
				return item?.key === 'profile'
					|| (item?.url || '').indexOf('/personInfo/') !== -1
			},
			async handleServiceClick(item) {
				if (item?.key === 'cart' && (this.miniappUi.enablePay === false || this.miniappUi.showCart === false)) {
					return
				}
				if (item?.key === 'coupon' && this.miniappUi.enablePay === false) {
					return
				}
				if (item?.key === 'verify' && !this.rechargeEnabled) {
					return
				}
				if (this.isPublicService(item)) {
					if (item.url) {
						uni.navigateTo({ url: item.url })
					}
					return
				}
				if (this.isProfileService(item)) {
					if (!(await requireLogin({ force: true }))) return
					if (item.url) {
						uni.navigateTo({ url: item.url })
					}
					return
				}
				if (item.key === 'phone' && !this.isMerchant) {
					this.openContactStore()
					return
				}
				if (!(await this.ensureOrdinaryUserPhone())) return
				if (item.key === 'share') {
					this.handleShareMiniProgram()
					return
				}
				if (this.isTabService(item)) {
					uni.switchTab({
						url: '/pages/personalCenter/storeOrder/index'
					})
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
				if (!this.isMerchant || this.storeExpired) return
				uni.navigateTo({
					url: '/pages/personalCenter/storeProfile/index'
				})
			},
			async goBusinessStatus() {
				if (!this.isMerchant || this.storeExpired) return
				if (!(await requireLogin({ force: true }))) return
				uni.navigateTo({
					url: '/pages/personalCenter/businessStatus/index'
				})
			},
			handleShareMiniProgram() {
				// #ifdef MP-WEIXIN
				// 分享到店铺首页，带上当前浏览店铺，接收人点开即进入该店逛店页
				this.shareConfig = {
					title: DEFAULT_SHARE.title,
					path: buildStoreHomeSharePath(this.userProfile),
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
			},
			normalizePhone(value) {
				return String(value || '').replace(/\s+/g, '').trim()
			},
			async openContactStore() {
				if (this.contactStoreLoading) return
				this.contactStoreLoading = true
				uni.showLoading({ title: '加载中', mask: true })
				try {
					const storeId = resolveViewStoreId(this.loggedIn ? this.userProfile : null)
					const data = await getStoreListApi({
						storeId,
						pageNum: 1,
						pageSize: 1
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const store = list[0]
					const phone = this.normalizePhone(store?.identityPhone)
					if (!store || !phone) {
						uni.showToast({
							title: '暂未提供联系电话',
							icon: 'none'
						})
						return
					}
					this.contactStoreName = store.storeName || '店铺'
					this.contactStorePhone = phone
					this.contactStoreShow = true
				} catch (error) {
					console.error('获取店家电话失败', error)
					uni.showToast({
						title: '暂时无法联系店家',
						icon: 'none'
					})
				} finally {
					this.contactStoreLoading = false
					uni.hideLoading()
				}
			},
			closeContactStore() {
				this.contactStoreShow = false
			},
			handleCallStore() {
				const phone = this.normalizePhone(this.contactStorePhone)
				if (!phone) {
					uni.showToast({
						title: '暂未提供联系电话',
						icon: 'none'
					})
					return
				}
				uni.makePhoneCall({
					phoneNumber: phone,
					fail: (err) => {
						const msg = String(err?.errMsg || '')
						if (msg.includes('cancel') || msg.includes('取消')) return
						uni.showToast({
							title: '拨打失败',
							icon: 'none'
						})
					}
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

	.page-loading {
		padding-top: 240rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.loading-text {
		font-size: 26rpx;
		color: #999;
	}

	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 320rpx;
		background: linear-gradient(180deg, #e8f8f6 0%, #f2fbfb 60%, #f5f5f5 100%);
	}

	.rent-notice-wrap {
		position: relative;
		margin: 16rpx 24rpx 0;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.profile-section {
		position: relative;
		display: flex;
		align-items: center;
		padding: 32rpx 32rpx 24rpx;
	}

	.owned-store-switch {
		position: relative;
		margin: 0 24rpx 16rpx;
		padding: 18rpx 24rpx;
		border-radius: 12rpx;
		background: #fff;
		display: flex;
		align-items: center;
		gap: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.owned-store-label {
		flex-shrink: 0;
		font-size: 24rpx;
		color: #999;
	}

	.owned-store-name {
		flex: 1;
		min-width: 0;
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.owned-store-arrow {
		flex-shrink: 0;
		font-size: 24rpx;
		color: $primary;
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

	.name-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		min-width: 0;
	}

	.badge-group {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: 8rpx;
	}

	.store-name {
		/* 不再 flex:1 撑满整行，否则标识会被推到最右侧、与昵称之间留出空白 */
		flex: 0 1 auto;
		max-width: 340rpx;
		font-size: 34rpx;
		font-weight: 700;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.staff-badge {
		flex-shrink: 0;
		padding: 4rpx 14rpx;
		border-radius: 8rpx;
		font-size: 20rpx;
		font-weight: 600;
		letter-spacing: 1rpx;
		color: #8a5a12;
		background: linear-gradient(135deg, #f8e3b0 0%, #e8c36a 100%);
		border: 1rpx solid #d4a84b;
		box-shadow: 0 2rpx 6rpx rgba(212, 168, 75, 0.28);
	}

	/* 店长标识：与店员标识同一套样式，仅文案与配色区分 */
	.owner-badge {
		flex-shrink: 0;
		padding: 4rpx 14rpx;
		border-radius: 8rpx;
		font-size: 20rpx;
		font-weight: 600;
		letter-spacing: 1rpx;
		color: #8a5a12;
		background: linear-gradient(135deg, #f8e3b0 0%, #e8c36a 100%);
		border: 1rpx solid #d4a84b;
		box-shadow: 0 2rpx 6rpx rgba(212, 168, 75, 0.28);
	}

	/* 储值会员标识：黑金质感，比店员/店长更"尊贵" */
	.vip-badge {
		flex-shrink: 0;
		padding: 4rpx 14rpx;
		border-radius: 8rpx;
		font-size: 20rpx;
		font-weight: 700;
		font-style: italic;
		letter-spacing: 1rpx;
		color: #f7e3a1;
		background: linear-gradient(135deg, #2b2b2b 0%, #4a4a4a 55%, #1f1f1f 100%);
		border: 1rpx solid #c9a227;
		box-shadow: 0 2rpx 8rpx rgba(201, 162, 39, 0.35);
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.45);
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

	.switch-own-store {
		max-width: 220rpx;
		padding: 10rpx 16rpx;
		line-height: 1.3;
		text-align: center;
		white-space: normal;
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

	.staff-card {
		background: linear-gradient(180deg, #fffaf0 0%, #ffffff 70%);
		border: 1rpx solid #f0d9a6;
		box-shadow: 0 2rpx 12rpx rgba(212, 168, 75, 0.12);
	}

	.staff-section-title {
		color: #8a5a12;
		border-left-color: #e8c36a;
	}

	.staff-icon-wrap {
		background: linear-gradient(135deg, #f8e3b0 0%, #e8c36a 100%) !important;
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

	.header-recharge {
		font-size: 28rpx;
		font-weight: 600;
		color: #00a896;
		line-height: 1;
	}

	.member-entry {
		flex-shrink: 0;
		max-width: 240rpx;
		padding: 14rpx 32rpx;
		border-radius: 32rpx;
		/* 黑金质感，呼应头部 VIP 标识 */
		background: linear-gradient(135deg, #2b2b2b 0%, #4a4a4a 55%, #1f1f1f 100%);
		border: 1rpx solid #c9a227;
		box-shadow: 0 4rpx 12rpx rgba(201, 162, 39, 0.32);
		color: #f7e3a1;
		font-size: 26rpx;
		font-weight: 700;
		letter-spacing: 2rpx;
		line-height: 1.3;
		text-align: center;
	}

	.account-row {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		margin-bottom: 8rpx;
	}

	.account-row-grid {
		justify-content: space-between;
	}

	.account-row-grid .account-item {
		flex: 1;
		width: auto;
	}

	.account-item {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		text-align: center;
	}

	.account-item-right {
		// padding-left: 40rpx;
	}

	.account-label-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}

	.account-label {
		font-size: 24rpx;
		color: #999;
	}

	.settle-help {
		flex-shrink: 0;
		width: 28rpx;
		height: 28rpx;
		border-radius: 50%;
		border: 2rpx solid #c0c0c0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.settle-help-mark {
		font-size: 18rpx;
		color: #999;
		line-height: 1;
		font-weight: 600;
	}

	.account-value {
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.currency {
		font-size: 28rpx;
		font-weight: 600;
		color: $primary;
		margin-right: 4rpx;
	}

	.amount {
		font-size: 36rpx;
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
		width: 100%;
		display: block;
		box-sizing: border-box;
		padding: 8rpx 24rpx 0;
		color: #1179ff;
		font-size: 24rpx;
		line-height: 1.6;
		text-align: center;
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

	.contact-store-popup {
		padding: 16rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.contact-store-handle {
		width: 64rpx;
		height: 8rpx;
		border-radius: 4rpx;
		background-color: #ddd;
		margin-bottom: 24rpx;
	}

	.contact-store-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.contact-store-name {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #666;
	}

	.contact-store-phone {
		margin-top: 12rpx;
		font-size: 40rpx;
		font-weight: 700;
		color: #333;
		letter-spacing: 2rpx;
	}

	.contact-store-btn {
		margin-top: 40rpx;
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background-color: #00a896;
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
		border-radius: 44rpx;
	}

	.settle-tip-popup {
		width: 600rpx;
		padding: 48rpx 40rpx 40rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	.settle-tip-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		text-align: center;
	}

	.settle-tip-text {
		margin-top: 24rpx;
		font-size: 28rpx;
		color: #666;
		text-align: left;
		line-height: 1.6;
	}

	.settle-tip-note {
		margin-top: 24rpx;
		font-size: 26rpx;
		color: #c47a12;
		text-align: left;
		line-height: 1.6;
	}

	.settle-tip-btn {
		margin-top: 40rpx;
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background-color: #00a896;
		color: #fff;
		font-size: 28rpx;
		font-weight: 600;
		border-radius: 40rpx;
	}
</style>