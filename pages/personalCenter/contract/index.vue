<template>
	<view class="contract-page">
		<view class="notice-bar">
			<text class="notice-badge">公告</text>
			<view class="notice-track">
				<view class="notice-marquee" :style="{ animationDuration: noticeDuration }">
					<text class="notice-text">如需打印合同请登录电脑端系统打印</text>
				</view>
			</view>
		</view>
		<view class="contract-body">
		<view class="filter-wrap">
			<up-subsection
				mode="button"
				:list="sectionList"
				:current="currentSection"
				activeColor="#00a896"
				inactiveColor="#ffffff"
				bgColor="#00a896"
				@change="handleSectionChange"
			></up-subsection>
		</view>

		<view v-if="loading && !list.length" class="empty-wrap">
			<up-loading-icon color="#00a896"></up-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>
		<view v-else-if="!list.length" class="empty-wrap">
			<u-empty :text="emptyText" mode="list"></u-empty>
		</view>
		<view v-else class="record-list">
			<view
				v-for="item in list"
				:key="item.contractNo"
				class="record-card"
				hover-class="record-card--hover"
				@click="goDetail(item)"
			>
				<view class="record-main">
					<view class="record-info">
						<text class="record-title">{{ item.contractName }}</text>
						<text class="record-desc">{{ item.contractNo }}</text>
						<text class="record-time">{{ formatTime(item.pushTime || item.createdTime) }}</text>
					</view>
					<view class="record-right">
						<text class="record-status" :class="statusClass(item)">{{ item.statusLabel || '待签署' }}</text>
						<up-icon name="arrow-right" size="14" color="#c8c9cc"></up-icon>
					</view>
				</view>
			</view>
		</view>
		</view>
	</view>
</template>

<script>
	import { requireLogin } from '@/common/auth.js'
	import { getMyContractListApi } from '@/common/api/personalCenter/contract.js'

	const TABS = ['pending', 'done', 'void']

	export default {
		data() {
			return {
				loading: false,
				currentSection: 0,
				sectionList: ['待我签署', '已完成', '已作废'],
				list: []
			}
		},
		computed: {
			emptyText() {
				if (this.currentSection === 1) return '暂无已完成合同'
				if (this.currentSection === 2) return '暂无作废合同'
				return '暂无待签署合同'
			},
			noticeDuration() {
				const text = '如需打印合同请登录电脑端系统打印'
				const seconds = Math.min(48, Math.max(12, (text.length + 16) * 0.32))
				return `${seconds}s`
			}
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			this.loadList()
		},
		onPullDownRefresh() {
			this.loadList().finally(() => uni.stopPullDownRefresh())
		},
		methods: {
			handleSectionChange(index) {
				this.currentSection = index
				this.loadList()
			},
			async loadList() {
				this.loading = true
				try {
					const data = await getMyContractListApi({
						tab: TABS[this.currentSection] || 'pending',
						pageNum: 1,
						pageSize: 50
					})
					this.list = Array.isArray(data) ? data : (data?.list || [])
				} catch (error) {
					console.error('加载合同失败', error)
					this.list = []
				} finally {
					this.loading = false
				}
			},
			formatTime(value) {
				if (!value) return ''
				return String(value).replace('T', ' ').slice(0, 16)
			},
			statusClass(item) {
				const status = Number(item.contractStatus)
				if (status === 2) return 'is-done'
				if (status === 3) return 'is-void'
				return 'is-pending'
			},
			goDetail(item) {
				uni.navigateTo({
					url: `/pages/personalCenter/contract/detail?no=${encodeURIComponent(item.contractNo)}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.contract-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		box-sizing: border-box;
	}

	.contract-body {
		padding: 0 24rpx 24rpx;
	}

	.notice-bar {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 12rpx;
		height: 64rpx;
		margin: 16rpx 16rpx 12rpx;
		padding: 0 16rpx 0 12rpx;
		border-radius: 12rpx;
		background: #fff;
		overflow: hidden;
	}

	.notice-badge {
		flex-shrink: 0;
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
		background: #fff1e8;
		color: #d46b08;
		font-size: 20rpx;
		font-weight: 700;
		line-height: 32rpx;
	}

	.notice-track {
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	.notice-marquee {
		display: inline-block;
		padding-left: 100%;
		white-space: nowrap;
		animation-name: contract-notice-scroll;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	.notice-text {
		display: inline-block;
		font-size: 24rpx;
		line-height: 64rpx;
		color: #8c4a12;
		white-space: nowrap;
	}

	.filter-wrap {
		margin-bottom: 24rpx;
	}

	.empty-wrap {
		padding-top: 160rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.loading-text {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #999;
	}

	.record-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.record-card--hover {
		opacity: 0.92;
	}

	.record-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
	}

	.record-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.record-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.record-desc,
	.record-time {
		font-size: 24rpx;
		color: #999;
	}

	.record-right {
		display: flex;
		align-items: center;
		gap: 8rpx;
		flex-shrink: 0;
	}

	.record-status {
		font-size: 24rpx;
	}

	.is-pending {
		color: #00a896;
	}

	.is-done {
		color: #19be6b;
	}

	.is-void {
		color: #999;
	}
</style>

<style lang="scss">
	@keyframes contract-notice-scroll {
		0% {
			transform: translateX(0);
		}

		100% {
			transform: translateX(-100%);
		}
	}
</style>
