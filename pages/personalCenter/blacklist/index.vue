<template>
	<view class="blacklist-page">
		<view v-if="!blacklist.length" class="empty-wrap">
			<u-empty text="暂无黑名单用户" mode="list"></u-empty>
		</view>

		<view v-else class="list-card">
			<u-list :height="listHeight">
				<u-list-item v-for="item in blacklist" :key="item.id">
					<u-cell
						:title="item.nickname"
						:label="item.blockTime"
						isLink
						clickable
						:border="false"
						@click="handleCellClick(item)"
					>
						<template #icon>
							<view class="avatar-wrap">
								<u-avatar :src="item.avatar" size="40"></u-avatar>
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
	import { blacklistData } from './mock.js'

	export default {
		data() {
			return {
				blacklist: [],
				listHeight: '0',
				actionSheetShow: false,
				currentItem: null,
				actionList: [
					{ name: '解除拉黑', color: '#00a896' }
				]
			}
		},
		onLoad() {
			this.initListHeight()
			this.loadBlacklist()
		},
		methods: {
			initListHeight() {
				const { windowHeight } = uni.getSystemInfoSync()
				this.listHeight = `${windowHeight - 48}px`
			},
			loadBlacklist() {
				const cached = uni.getStorageSync('blacklist')
				this.blacklist = cached && cached.length ? cached : [...blacklistData]
			},
			saveBlacklist() {
				uni.setStorageSync('blacklist', this.blacklist)
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
				if (!this.currentItem) return

				const targetId = this.currentItem.id
				this.blacklist = this.blacklist.filter(item => item.id !== targetId)
				this.saveBlacklist()

				uni.showToast({
					title: '已解除拉黑',
					icon: 'success'
				})
				this.closeActionSheet()
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
