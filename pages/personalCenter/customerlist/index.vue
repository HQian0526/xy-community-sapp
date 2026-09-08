<template>
	<view class="customer-page">
		<view v-if="loading && !customerList.length" class="empty-wrap">
			<up-loading-icon color="#00a896"></up-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<view v-else-if="!customerList.length" class="empty-wrap">
			<u-empty text="暂无顾客" mode="list"></u-empty>
		</view>

		<view v-else class="list-card">
			<u-list :height="listHeight">
				<u-list-item v-for="item in customerList" :key="item.id">
					<u-cell
						:title="item.nickname"
						:label="item.label"
						isLink
						clickable
						:border="false"
						@click="handleCellClick(item)"
					>
						<template #icon>
							<view class="avatar-wrap">
								<u-avatar :src="item.avatar || defaultAvatar" size="40"></u-avatar>
							</view>
						</template>
					</u-cell>
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
	import { requireLogin } from '@/common/auth.js'
	import { resolveFileUrl } from '@/common/api/config.js'
	import {
		getCustomerListApi,
		mapCustomerItem
	} from '@/common/api/personalCenter/user.js'
	import { addStoreBlacklistApi } from '@/common/api/personalCenter/blacklist.js'

	export default {
		data() {
			return {
				customerList: [],
				listHeight: '0',
				loading: false,
				blocking: false,
				actionSheetShow: false,
				currentItem: null,
				defaultAvatar: storeInfo.avatar,
				actionList: [
					{ name: '拉黑', color: '#fa3534' }
				]
			}
		},
		onLoad() {
			this.initListHeight()
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			this.loadCustomerList()
		},
		onPullDownRefresh() {
			this.loadCustomerList().finally(() => uni.stopPullDownRefresh())
		},
		methods: {
			initListHeight() {
				const { windowHeight } = getWindowLayout()
				this.listHeight = `${windowHeight - 48}px`
			},
			async loadCustomerList() {
				this.loading = true
				try {
					const data = await getCustomerListApi({
						pageNum: 1,
						pageSize: 100
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					this.customerList = list.map((item) => {
						const mapped = mapCustomerItem(item)
						mapped.avatar = resolveFileUrl(mapped.avatar)
						return mapped
					})
				} catch (error) {
					console.error('加载顾客列表失败', error)
					this.customerList = []
				} finally {
					this.loading = false
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
			handleActionSelect() {
				if (!this.currentItem || this.blocking) return
				const target = this.currentItem
				this.closeActionSheet()
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
		padding: 24rpx;
		box-sizing: border-box;
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
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.avatar-wrap {
		margin-right: 16rpx;
	}
</style>
