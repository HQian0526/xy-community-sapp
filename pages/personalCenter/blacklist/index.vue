<template>
	<view class="blacklist-page" :style="themeCssVars">
		<xy-navbar />
		<view v-if="loading && !blacklist.length" class="empty-wrap">
			<up-loading-icon :color="themePrimary"></up-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<view v-else-if="!blacklist.length" class="empty-wrap">
			<u-empty text="暂无黑名单用户" mode="list"></u-empty>
		</view>

		<view v-else class="list-card">
			<u-list :height="listHeight">
				<u-list-item v-for="item in blacklist" :key="item.id">
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
								<u-avatar :src="defaultAvatar" size="40"></u-avatar>
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
	import {
		getStoreBlacklistApi,
		deleteStoreBlacklistApi,
		mapBlacklistItem
	} from '@/common/api/personalCenter/blacklist.js'

	export default {
		data() {
			return {
				blacklist: [],
				listHeight: '0',
				loading: false,
				unblocking: false,
				actionSheetShow: false,
				currentItem: null,
				defaultAvatar: storeInfo.avatar,
				actionList: [
					{ name: '解除拉黑', color: this.themePrimary }
				]
			}
		},
		onLoad() {
			this.initListHeight()
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			this.loadBlacklist()
		},
		onPullDownRefresh() {
			this.loadBlacklist().finally(() => uni.stopPullDownRefresh())
		},
		methods: {
			initListHeight() {
				const { windowHeight } = getWindowLayout()
				this.listHeight = `${windowHeight - 48}px`
			},
			async loadBlacklist() {
				this.loading = true
				try {
					const data = await getStoreBlacklistApi({
						pageNum: 1,
						pageSize: 100
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					this.blacklist = list.map(mapBlacklistItem)
				} catch (error) {
					console.error('加载黑名单失败', error)
					this.blacklist = []
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
				if (!this.currentItem || this.unblocking) return
				const target = this.currentItem
				this.closeActionSheet()
				uni.showModal({
					title: '解除拉黑',
					content: `确定将「${target.nickname}」从黑名单中移除？`,
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) this.unblockUser(target)
					}
				})
			},
			async unblockUser(target) {
				if (!target?.id || this.unblocking) return
				this.unblocking = true
				try {
					await deleteStoreBlacklistApi([target.id])
					this.blacklist = this.blacklist.filter((item) => item.id !== target.id)
					uni.showToast({
						title: '已解除拉黑',
						icon: 'success'
					})
				} catch (error) {
					console.error('解除拉黑失败', error)
				} finally {
					this.unblocking = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.blacklist-page {
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
