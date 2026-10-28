<template>
	<view class="intro-page">
		<view class="header-bg"></view>

		<view v-if="pageLoading" class="page-loading">
			<up-loading-icon color="#00a896"></up-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<template v-else>
			<view class="profile-section">
				<view class="avatar-wrap">
					<image class="avatar-img" :src="headerAvatar" mode="aspectFill" />
				</view>
				<view class="profile-info">
					<view class="name-row">
						<text class="store-name">{{ headerName }}</text>
						<text
							v-if="storeProfile.storeId"
							class="status-tag"
							:class="'status-tag--' + openStatusKey"
						>{{ openStatusLabel }}</text>
					</view>
					<text class="store-tip">了解本店服务与联系方式</text>
				</view>
			</view>

			<view class="content-wrap">
				<view class="section-card">
					<view class="section-head">
						<view class="section-icon">
							<up-icon name="file-text" size="18" color="#00a896"></up-icon>
						</view>
						<text class="section-title">店铺简介</text>
					</view>
					<text class="intro-text" :class="{ 'is-empty': !introText }">{{ introText || '店家暂未填写简介' }}</text>
				</view>

				<view v-if="showHoursModule" class="section-card">
					<view class="section-head">
						<view class="section-icon">
							<up-icon name="clock" size="18" color="#00a896"></up-icon>
						</view>
						<text class="section-title">营业时间</text>
					</view>
					<text class="section-body">{{ hoursText }}</text>
				</view>

				<view v-if="showActivityModule" class="section-card">
					<view class="section-head">
						<view class="section-icon">
							<up-icon name="gift" size="18" color="#00a896"></up-icon>
						</view>
						<text class="section-title">店铺活动</text>
					</view>
					<text v-if="activityNotice" class="section-body">{{ activityNotice }}</text>
					<view v-if="promoText" class="promo-row">
						<text class="promo-tag">满减</text>
						<text class="promo-text">{{ promoText }}</text>
					</view>
				</view>

				<view
					v-if="showContactModule"
					class="section-card contact-row"
					@click="handleCallStore"
				>
					<view class="section-head contact-head">
						<view class="section-icon">
							<up-icon name="phone" size="18" color="#00a896"></up-icon>
						</view>
						<text class="section-title">咨询 / 合作 / 联系电话</text>
					</view>
					<view class="contact-value">
						<text class="contact-phone">{{ contactPhone }}</text>
						<up-icon name="arrow-right" size="12" color="#bbb"></up-icon>
					</view>
				</view>

				<view v-if="showOtherBusinessModule" class="biz-panel">
					<view class="biz-panel-head">
						<text class="biz-panel-title">本店其他业务</text>
						<text class="biz-panel-count">{{ businessList.length }}项</text>
					</view>
					<view
						v-for="(item, index) in businessList"
						:key="item.id"
						class="biz-item"
						:class="{ 'is-last': index === businessList.length - 1 }"
					>
						<view class="biz-index">{{ index + 1 }}</view>
						<view class="biz-body">
							<view class="biz-name-row">
								<text class="biz-name">{{ item.name }}</text>
								<text class="biz-fee">{{ item.fee }}</text>
							</view>
							<text v-if="item.description" class="biz-desc">{{ item.description }}</text>
						</view>
					</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	import { storeInfo as defaultStoreInfo } from '../personalCenter/mock.js'
	import {
		getOtherBusinessListApi,
		mapOtherBusinessItem
	} from '@/common/api/personalCenter/otherBusiness.js'
	import {
		isLoggedIn,
		waitBootstrapAuth,
		ensureUserInfo
	} from '@/common/auth.js'
	import {
		getStoreListApi,
		formatBusinessHoursText,
		getStoreOpenLabel
	} from '@/common/api/personalCenter/store.js'
	import {
		bindStoreId
	} from '@/config/index.js'
	import {
		applyLaunchQuery,
		resolveViewStoreId,
		shouldForceOrdinaryUi,
		setOwnMerchantStoreId,
		getOwnMerchantStoreId,
		applyOwnedWorkplace
	} from '@/common/storeVisit.js'
	import {
		resolveFileUrl
	} from '@/common/api/config.js'
	import {
		getActivePromoApi,
		promoBarText
	} from '@/common/api/mall/promo.js'

	const DEFAULT_AVATAR = defaultStoreInfo.avatar
	const IDENTITY_USER = 1
	const IDENTITY_MERCHANT = 2

	function flagOn(value) {
		if (value === undefined || value === null || value === '') return true
		return Number(value) === 1
	}

	export default {
		data() {
			return {
				userProfile: {
					id: null,
					realName: '',
					phone: '',
					avatar: '',
					identityType: IDENTITY_USER,
					bindStoreId: '',
					lastStoreId: '',
					staffStoreId: ''
				},
				queryStoreId: '',
				storeProfile: {
					storeId: '',
					storeName: '',
					avatar: '',
					intro: '',
					contactPhone: '',
					activityNotice: '',
					businessHours: '',
					businessHoursText: '',
					openStatus: '',
					showHours: 1,
					showActivity: 1,
					showContact: 1,
					showOtherBusiness: 1
				},
				pageLoading: true,
				businessList: [],
				promoText: ''
			}
		},
		computed: {
			headerName() {
				return this.storeProfile.storeName || '社区店铺'
			},
			headerAvatar() {
				return this.storeProfile.avatar || DEFAULT_AVATAR
			},
			introText() {
				return String(this.storeProfile.intro || '').trim()
			},
			openStatusLabel() {
				return getStoreOpenLabel(this.storeProfile)
			},
			openStatusKey() {
				if (this.storeProfile.openStatus === 'closed') return 'closed'
				if (this.storeProfile.openStatus === 'rest') return 'rest'
				return 'open'
			},
			hoursText() {
				return this.storeProfile.businessHoursText
					|| formatBusinessHoursText(this.storeProfile.businessHours)
					|| '全天营业'
			},
			activityNotice() {
				return String(this.storeProfile.activityNotice || '').trim()
			},
			contactPhone() {
				return String(this.storeProfile.contactPhone || '').replace(/\s+/g, '').trim()
			},
			showHoursModule() {
				return flagOn(this.storeProfile.showHours)
			},
			showActivityModule() {
				return flagOn(this.storeProfile.showActivity)
					&& !!(this.activityNotice || this.promoText)
			},
			showContactModule() {
				return flagOn(this.storeProfile.showContact) && !!this.contactPhone
			},
			showOtherBusinessModule() {
				return flagOn(this.storeProfile.showOtherBusiness) && this.businessList.length > 0
			}
		},
		onLoad(options = {}) {
			applyLaunchQuery(options)
		},
		async onShow() {
			applyLaunchQuery()
			await waitBootstrapAuth()
			await this.reloadPage()
		},
		onPullDownRefresh() {
			Promise.resolve()
				.then(async () => {
					await waitBootstrapAuth()
					await this.reloadPage()
				})
				.finally(() => {
					uni.stopPullDownRefresh()
				})
		},
		methods: {
			async reloadPage() {
				if (!this.storeProfile.storeName && !this.businessList.length) {
					this.pageLoading = true
				}
				try {
					await this.loadHeaderProfile()
					const storeId = this.queryStoreId || this.storeProfile.storeId || bindStoreId
					await Promise.all([
						this.loadBusinessList(storeId),
						this.loadPromo(storeId)
					])
				} finally {
					this.pageLoading = false
				}
			},
			async loadHeaderProfile() {
				if (!isLoggedIn()) {
					this.userProfile = {
						id: null,
						realName: '',
						phone: '',
						avatar: '',
						identityType: IDENTITY_USER,
						bindStoreId: bindStoreId,
						lastStoreId: '',
						staffStoreId: ''
					}
					this.queryStoreId = resolveViewStoreId(null)
					await this.fetchStoreInfo({
						storeId: this.queryStoreId
					})
					return
				}
				try {
					await this.fetchUserInfo()
					const identityMerchant = Number(this.userProfile.identityType) === IDENTITY_MERCHANT
					if (identityMerchant && this.userProfile.id) {
						await this.fetchStoreInfo({
							userId: this.userProfile.id
						})
					}
					this.queryStoreId = resolveViewStoreId(this.userProfile)
					if (shouldForceOrdinaryUi(this.userProfile) || !identityMerchant) {
						if (this.queryStoreId) {
							await this.fetchStoreInfo({
								storeId: this.queryStoreId
							})
						}
					}
				} catch (error) {
					console.error('加载店铺资料失败', error)
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
						staffStoreId: user.staffStoreId == null ? '' : String(user.staffStoreId),
						lastStoreId: user.lastStoreId == null ? '' : String(user.lastStoreId)
					}
					applyOwnedWorkplace(user)
					this.queryStoreId = resolveViewStoreId(this.userProfile)
				} catch (error) {
					console.error('获取用户信息失败', error)
					this.queryStoreId = resolveViewStoreId(null)
				}
			},
			emptyStoreProfile() {
				return {
					storeId: '',
					storeName: '',
					avatar: '',
					intro: '',
					contactPhone: '',
					activityNotice: '',
					businessHours: '',
					businessHoursText: '',
					openStatus: '',
					showHours: 1,
					showActivity: 1,
					showContact: 1,
					showOtherBusiness: 1
				}
			},
			mapStoreProfile(store) {
				return {
					storeId: store.storeId != null ? String(store.storeId) : '',
					storeName: store.storeName || '',
					avatar: resolveFileUrl(store.avatar || ''),
					intro: store.intro || '',
					contactPhone: store.contactPhone || '',
					activityNotice: store.activityNotice || '',
					businessHours: store.businessHours || '',
					businessHoursText: store.businessHoursText || '',
					openStatus: store.openStatus || '',
					manuallyClosed: store.manuallyClosed,
					acceptingOrders: store.acceptingOrders,
					storeStatus: store.storeStatus,
					showHours: flagOn(store.showHours) ? 1 : 0,
					showActivity: flagOn(store.showActivity) ? 1 : 0,
					showContact: flagOn(store.showContact) ? 1 : 0,
					showOtherBusiness: flagOn(store.showOtherBusiness) ? 1 : 0
				}
			},
			async fetchStoreInfo(params = {}) {
				try {
					const query = {}
					if (params.userId) query.userId = params.userId
					if (params.storeId) query.storeId = params.storeId
					if (!query.userId && !query.storeId) {
						this.storeProfile = this.emptyStoreProfile()
						return
					}
					const data = await getStoreListApi(query)
					const list = Array.isArray(data) ? data : (data?.list || [])
					const targetId = params.userId
						? String(this.userProfile.lastStoreId || getOwnMerchantStoreId() || '')
						: ''
					const matched = targetId
						? list.find((item) => String(item && item.storeId) === targetId)
						: null
					const store = matched || list[0]
					if (!store) {
						this.storeProfile = this.emptyStoreProfile()
						return
					}
					this.storeProfile = this.mapStoreProfile(store)
					if (params.userId && store.storeId) {
						setOwnMerchantStoreId(store.storeId)
					}
				} catch (error) {
					console.error('获取商户信息失败', error)
				}
			},
			async loadBusinessList(storeId) {
				if (!flagOn(this.storeProfile.showOtherBusiness)) {
					this.businessList = []
					return
				}
				try {
					const params = {}
					if (storeId) params.storeId = storeId
					const data = await getOtherBusinessListApi(params)
					const list = Array.isArray(data) ? data : (data?.list || [])
					this.businessList = list.map(mapOtherBusinessItem)
				} catch (error) {
					console.error('获取其他业务列表失败', error)
					this.businessList = []
				}
			},
			async loadPromo(storeId) {
				if (!flagOn(this.storeProfile.showActivity) || !storeId) {
					this.promoText = ''
					return
				}
				try {
					const promo = await getActivePromoApi(storeId)
					this.promoText = promoBarText(promo)
				} catch (error) {
					console.error('获取店铺活动失败', error)
					this.promoText = ''
				}
			},
			handleCallStore() {
				const phone = this.contactPhone
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

	.intro-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 280rpx;
		background: linear-gradient(180deg, #e8f8f6 0%, #f2fbfb 60%, #f5f5f5 100%);
	}

	.page-loading {
		position: relative;
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

	.profile-section {
		position: relative;
		display: flex;
		align-items: center;
		padding: 32rpx 32rpx 16rpx;
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
		gap: 10rpx;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		min-width: 0;
	}

	.store-name {
		flex: 1;
		min-width: 0;
		font-size: 34rpx;
		font-weight: 700;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status-tag {
		flex-shrink: 0;
		font-size: 20rpx;
		line-height: 1;
		padding: 8rpx 12rpx;
		border-radius: 8rpx;
		background: rgba(0, 168, 150, 0.12);
		color: $primary;
	}

	.status-tag--rest {
		background: rgba(230, 162, 60, 0.14);
		color: #d48806;
	}

	.status-tag--closed {
		background: #f0f0f0;
		color: #999;
	}

	.store-tip {
		font-size: 24rpx;
		color: #999;
	}

	.content-wrap {
		position: relative;
		padding: 8rpx 24rpx 24rpx;
	}

	.section-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.section-icon {
		width: 44rpx;
		height: 44rpx;
		border-radius: 12rpx;
		background: rgba(0, 168, 150, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
	}

	.intro-text,
	.section-body {
		font-size: 28rpx;
		color: #555;
		line-height: 1.7;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.intro-text.is-empty {
		color: #bbb;
	}

	.promo-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-top: 16rpx;
	}

	.promo-tag {
		flex-shrink: 0;
		font-size: 22rpx;
		color: #fff;
		background: #ff6034;
		border-radius: 8rpx;
		padding: 4rpx 10rpx;
	}

	.promo-text {
		font-size: 26rpx;
		color: #ff6034;
		font-weight: 500;
	}

	.contact-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding-top: 24rpx;
		padding-bottom: 24rpx;
	}

	.contact-head {
		margin-bottom: 0;
		flex: 1;
		min-width: 0;
	}

	.contact-head .section-title {
		white-space: nowrap;
		font-size: 26rpx;
	}

	.contact-value {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.contact-phone {
		font-size: 30rpx;
		font-weight: 700;
		color: $primary;
		letter-spacing: 1rpx;
		white-space: nowrap;
	}

	.biz-panel {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 8rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.biz-panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 22rpx 24rpx;
		background: linear-gradient(90deg, rgba(0, 168, 150, 0.14) 0%, rgba(0, 168, 150, 0.04) 100%);
		border-bottom: 1rpx solid rgba(0, 168, 150, 0.12);
	}

	.biz-panel-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1a1a1a;
		letter-spacing: 1rpx;
	}

	.biz-panel-count {
		font-size: 22rpx;
		color: $primary;
		background: rgba(0, 168, 150, 0.12);
		padding: 4rpx 12rpx;
		border-radius: 999rpx;
		line-height: 1.4;
	}

	.biz-item {
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
		padding: 24rpx;
		border-bottom: 1rpx solid #f2f2f2;
	}

	.biz-item.is-last {
		border-bottom: none;
	}

	.biz-index {
		flex-shrink: 0;
		width: 40rpx;
		height: 40rpx;
		border-radius: 10rpx;
		background: rgba(0, 168, 150, 0.12);
		color: $primary;
		font-size: 22rpx;
		font-weight: 700;
		line-height: 40rpx;
		text-align: center;
		margin-top: 4rpx;
	}

	.biz-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.biz-name-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16rpx;
	}

	.biz-name {
		flex: 1;
		min-width: 0;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		line-height: 1.4;
	}

	.biz-fee {
		flex-shrink: 0;
		font-size: 26rpx;
		font-weight: 600;
		color: #ff6034;
		line-height: 1.4;
		max-width: 240rpx;
		text-align: right;
	}

	.biz-desc {
		font-size: 24rpx;
		color: #888;
		line-height: 1.55;
	}
</style>
