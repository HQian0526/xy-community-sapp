<template>
	<view class="customer-page">
		<view class="search-wrap">
			<up-search
				v-model="keyword"
				placeholder="搜索手机号或昵称"
				shape="round"
				bgColor="#fff"
				:showAction="false"
				@change="onKeywordChange"
				@search="onKeywordSearch"
				@clear="onKeywordClear"
			></up-search>
		</view>

		<view v-if="loading && !customerList.length" class="empty-wrap">
			<up-loading-icon color="#00a896"></up-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<view v-else-if="!customerList.length" class="empty-wrap">
			<u-empty :text="keyword ? '未找到相关顾客' : '暂无顾客'" mode="list"></u-empty>
		</view>

		<view v-else class="list-card">
			<u-list :height="listHeight">
				<u-list-item v-for="item in customerList" :key="item.id">
					<view
						class="customer-item"
						hover-class="customer-item--hover"
						@click="handleCellClick(item)"
					>
						<view class="avatar-wrap" :class="{ 'is-member': item.member }">
							<u-avatar :src="item.avatar || defaultAvatar" size="40"></u-avatar>
						</view>
						<view class="customer-main">
							<view class="name-row">
								<text class="nickname">{{ item.nickname }}</text>
								<view v-if="item.member" class="vip-tag">
									<up-icon name="level" size="12" color="#F6E2B3"></up-icon>
									<text class="vip-tag-text">储值会员</text>
								</view>
							</view>
							<text class="phone">{{ item.label }}</text>
						</view>
						<up-icon name="arrow-right" size="14" color="#c8c9cc"></up-icon>
					</view>
				</u-list-item>
			</u-list>
		</view>

		<u-action-sheet
			:show="actionSheetShow"
			:actions="actionList"
			cancelText="取消"
			round="16"
			@close="closeActionSheet"
			@select="handleActionSelect"
		></u-action-sheet>
	</view>
</template>

<script>
	import { storeInfo } from '../mock.js'
	import { getWindowLayout } from '@/common/systemInfo.js'
	import { getUserInfo, requireLogin } from '@/common/auth.js'
	import { resolveFileUrl } from '@/common/api/config.js'
	import { isStoreRechargeEnabled, syncMerchantMiniappUi } from '@/common/miniappUi.js'
	import {
		getCustomerListApi,
		mapCustomerItem
	} from '@/common/api/personalCenter/user.js'
	import { addStoreBlacklistApi } from '@/common/api/personalCenter/blacklist.js'

	export default {
		data() {
			return {
				keyword: '',
				customerList: [],
				listHeight: '0',
				loading: false,
				blocking: false,
				actionSheetShow: false,
				currentItem: null,
				searchTimer: null,
				enablePay: false,
				defaultAvatar: storeInfo.avatar
			}
		},
		computed: {
			actionList() {
				const list = []
				if (this.enablePay) {
					list.push({ name: '储值', color: '#00a896' })
				}
				list.push({ name: '拉黑', color: '#fa3534' })
				return list
			}
		},
		onReady() {
			this.initListHeight()
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			this.$nextTick(() => this.initListHeight())
			await this.syncEnablePay()
			this.loadCustomerList()
		},
		onUnload() {
			this.clearSearchTimer()
		},
		onPullDownRefresh() {
			this.loadCustomerList().finally(() => uni.stopPullDownRefresh())
		},
		methods: {
			initListHeight() {
				const { windowHeight } = getWindowLayout()
				this.$nextTick(() => {
					uni.createSelectorQuery()
						.in(this)
						.select('.search-wrap')
						.boundingClientRect((rect) => {
							const top = rect && rect.bottom != null ? rect.bottom : 72
							const bottomGap = 12
							this.listHeight = `${Math.max(Math.floor(windowHeight - top - bottomGap), 200)}px`
						})
						.exec()
				})
			},
			async syncEnablePay() {
				this.enablePay = false
				try {
					await syncMerchantMiniappUi(getUserInfo())
				} catch (error) {
					console.error('同步店铺支付权限失败', error)
				}
				this.enablePay = isStoreRechargeEnabled()
			},
			clearSearchTimer() {
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
					this.searchTimer = null
				}
			},
			onKeywordChange() {
				this.clearSearchTimer()
				this.searchTimer = setTimeout(() => {
					this.loadCustomerList()
				}, 400)
			},
			onKeywordSearch(value) {
				this.keyword = String(value || '').trim()
				this.clearSearchTimer()
				this.loadCustomerList()
			},
			onKeywordClear() {
				this.keyword = ''
				this.clearSearchTimer()
				this.loadCustomerList()
			},
			async loadCustomerList() {
				this.loading = true
				const keyword = String(this.keyword || '').trim()
				try {
					const params = {
						pageNum: 1,
						pageSize: 100
					}
					if (keyword) {
						params.keyword = keyword
					}
					const data = await getCustomerListApi(params)
					if (String(this.keyword || '').trim() !== keyword) return
					const list = Array.isArray(data) ? data : (data?.list || [])
					this.customerList = list.map((item) => {
						const mapped = mapCustomerItem(item)
						mapped.avatar = resolveFileUrl(mapped.avatar)
						return mapped
					})
				} catch (error) {
					console.error('加载顾客列表失败', error)
					if (String(this.keyword || '').trim() === keyword) {
						this.customerList = []
					}
				} finally {
					if (String(this.keyword || '').trim() === keyword) {
						this.loading = false
					}
				}
			},
			handleCellClick(item) {
				this.currentItem = item
				this.actionSheetShow = true
			},
			closeActionSheet() {
				this.actionSheetShow = false
				this.currentItem = null
			},
			handleActionSelect(action) {
				if (!this.currentItem || this.blocking) return
				const target = this.currentItem
				const name = action?.name || ''
				this.closeActionSheet()
				if (name === '储值') {
					if (!isStoreRechargeEnabled()) {
						this.enablePay = false
						uni.showToast({
							title: '当前店铺未接入储值',
							icon: 'none'
						})
						return
					}
					this.goRecharge(target)
					return
				}
				if (name && name !== '拉黑') return
				uni.showModal({
					title: '拉黑',
					content: `确定将「${target.nickname}」加入黑名单？拉黑后将无法在本店下单。`,
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) this.blockUser(target)
					}
				})
			},
			goRecharge(target) {
				if (!target?.userId) {
					uni.showToast({
						title: '顾客信息不完整',
						icon: 'none'
					})
					return
				}
				if (!this.enablePay) {
					uni.showToast({
						title: '当前店铺未接入储值',
						icon: 'none'
					})
					return
				}
				const query = [
					`userId=${encodeURIComponent(target.userId)}`,
					`nickname=${encodeURIComponent(target.nickname || '')}`,
					`phone=${encodeURIComponent(target.phone || '')}`
				].join('&')
				uni.navigateTo({
					url: `/pages/personalCenter/customerRecharge/index?${query}`
				})
			},
			async blockUser(target) {
				if ((!target?.userId && !target?.phone) || this.blocking) return
				this.blocking = true
				try {
					const payload = {}
					if (target.userId) payload.userId = target.userId
					if (target.phone) payload.phone = target.phone
					if (target.realName) payload.realName = target.realName
					await addStoreBlacklistApi(payload)
					this.customerList = this.customerList.filter((item) => item.id !== target.id)
					uni.showToast({
						title: '已拉黑',
						icon: 'success'
					})
				} catch (error) {
					console.error('拉黑失败', error)
				} finally {
					this.blocking = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.customer-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 16rpx 24rpx 0;
		box-sizing: border-box;
	}

	.search-wrap {
		margin-bottom: 16rpx;
	}

	.empty-wrap {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.loading-text {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #999;
	}

	.list-card {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-sizing: border-box;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.customer-item {
		display: flex;
		align-items: center;
		padding: 24rpx 24rpx 24rpx 20rpx;
		border-bottom: 1rpx solid #f4f4f4;
		box-sizing: border-box;
	}

	.customer-item:last-child {
		border-bottom: none;
	}

	.customer-item--hover {
		background-color: #f7f7f7;
	}

	.avatar-wrap {
		flex-shrink: 0;
		margin-right: 20rpx;
		padding: 4rpx;
		border-radius: 50%;
		background: transparent;
	}

	.avatar-wrap.is-member {
		background: linear-gradient(135deg, #f8e7b8 0%, #d4af6a 52%, #b8892d 100%);
		box-shadow: 0 2rpx 8rpx rgba(184, 134, 11, 0.28);
	}

	.customer-main {
		flex: 1;
		min-width: 0;
		margin-right: 12rpx;
	}

	.name-row {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.nickname {
		max-width: 280rpx;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		line-height: 42rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.vip-tag {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		height: 36rpx;
		padding: 0 12rpx 0 8rpx;
		margin-left: 12rpx;
		border-radius: 18rpx;
		background: linear-gradient(135deg, #3c3124 0%, #1f1810 100%);
		border: 1rpx solid rgba(243, 209, 138, 0.85);
		box-shadow: 0 2rpx 8rpx rgba(160, 110, 20, 0.22);
	}

	.vip-tag-text {
		margin-left: 4rpx;
		font-size: 20rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
		color: #f6e2b3;
		line-height: 1;
	}

	.phone {
		display: block;
		margin-top: 6rpx;
		font-size: 24rpx;
		color: #999;
		line-height: 34rpx;
	}
</style>
