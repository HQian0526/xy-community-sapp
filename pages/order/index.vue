<template>
	<view class="order-page">
		<u-title class="custom-title">
			<u-icon name="map" size="18"></u-icon>
			<text>{{socialName || '位置获取失败，请点击此处手动绑定'}}</text>
		</u-title>
		<!-- Banner 预留区域 -->
		<view class="banner-wrap">
			<view v-if="!bannerLoaded && !bannerError" class="banner-loading">
				<up-loading-icon color="#00a896"></up-loading-icon>
				<text class="banner-loading-text">图片加载中...</text>
			</view>
			<view v-if="bannerError" class="banner-loading banner-error" @click="retryBanner">
				<text class="banner-error-text">加载失败，点击重试</text>
			</view>
			<image
				v-if="!bannerError"
				class="banner-img"
				:class="{ 'banner-img--visible': bannerLoaded }"
				:src="bannerSrc"
				mode="contain"
				lazy-load
				@load="onBannerLoad"
				@error="onBannerError"
			/>
		</view>

		<!-- 分段器 -->
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
		<!-- 任务列表 -->
		<view v-if="displayList && displayList.length > 0" class="order-list">
			<view v-for="item in displayList" :key="item.id" class="order-card">
				<!-- 卡片头部 -->
				<view class="card-header">
					<text class="company-name">{{ item.companyName }}</text>
					<text class="status-tag" :class="'status-' + item.statusType">{{ item.status }}</text>
				</view>

				<!-- 卡片主体 -->
				<view class="card-body">
					<view class="fault-icon">
						<text class="fault-icon-text">{{ item.faultType }}</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">提交时间：</text>
							<text class="info-value">{{ item.submitTime }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">小费酬金：</text>
							<text class="info-value price-value">{{ item.price }}元</text>
						</view>
						<view v-if="item.faultType === '取件'" class="info-row">
							<text class="info-label take-code">取件码：</text>
							<text class="info-value take-code">{{ currentSection === 0 ? '接单后展示' : item.startCode }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">任务地址：</text>
							<text class="info-value">{{ item.address }}</text>
						</view>
					</view>
				</view>

				<!-- 详细描述 -->
				<view class="card-desc">
					<text class="desc-label">详细描述：</text>
					<text class="desc-text">{{ item.description }}</text>
				</view>

				<!-- 操作按钮 -->
				<view class="card-actions" @click.stop>
					<template v-if="currentSection === 0">
						<text class="action-btn action-success" @click="handleAccept(item)">我要接单</text>
					</template>
					<template v-else>
						<text class="action-btn action-primary" @click="handleCall(item)">联系客户</text>
						<text class="action-btn action-success" @click="handleComplete(item)">确认完成</text>
						<text class="action-btn action-danger" @click="handleCancelAccepted(item)">取消工单</text>
					</template>
				</view>
			</view>
			<view class="flex-center" style="color: #999999">
				已经到底了～
			</view>
		</view>

		<view v-else>
			<view class="no-order" style="color: #999999">{{ emptyText }}</view>
			<view class="btn-success-plain w-200 h-70 box-center mt-24 flex-center">
				<up-icon name="reload" color="#00a896"></up-icon>
				<text>刷新</text>
			</view>
		</view>

		<uni-fab ref="fab" :pattern="fabPattern" :content="fabContent" horizontal="right" vertical="bottom"
			direction="horizontal" :show="true" @trigger="handlePublish" />
	</view>
</template>

<script>
	import {
		getOrderList,
		removeOrder,
		bannerUrl
	} from './mock.js'
	import {
		getPendingTasks,
		setPendingTasks
	} from '../personalCenter/pending/mock.js'

	export default {
		data() {
			return {
				availableList: [],
				acceptedList: [],
				socialName: '上海-汤臣一品',
				bannerUrl,
				bannerSrc: bannerUrl,
				bannerLoaded: false,
				bannerError: false,
				fabPattern: {
					color: '#666',
					backgroundColor: '#fff',
					selectedColor: '#00a896',
					buttonColor: '#00a896',
					iconColor: '#fff',
					icon: 'plusempty'
				},
				fabContent: [{
					iconPath: '/static/plus.png',
					selectedIconPath: '/static/plus.png',
					text: '发布悬赏',
					active: false
				}],
				currentSection: 0,
				sectionList: [{
						name: '求助广场'
					},
					{
						name: '已接任务'
					},
				],
			}
		},
		computed: {
			displayList() {
				return this.currentSection === 0 ? this.availableList : this.acceptedList
			},
			emptyText() {
				return this.currentSection === 0 ? '暂无可接任务~' : '暂无已接任务~'
			}
		},
		onShow() {
			this.loadOrders()
		},
		onBackPress() {
			if (this.$refs.fab && this.$refs.fab.isShow) {
				this.$refs.fab.close()
				return true
			}
			return false
		},
		methods: {
			loadOrders() {
				this.availableList = getOrderList()
				this.acceptedList = getPendingTasks()
			},
			onBannerLoad() {
				this.bannerLoaded = true
				this.bannerError = false
			},
			onBannerError() {
				this.bannerLoaded = false
				this.bannerError = true
			},
			retryBanner() {
				this.bannerError = false
				this.bannerLoaded = false
				const separator = this.bannerUrl.includes('?') ? '&' : '?'
				this.bannerSrc = `${this.bannerUrl}${separator}t=${Date.now()}`
			},
			handleSectionChange(index) {
				this.currentSection = index
			},
			handleAccept(item) {
				uni.showModal({
					title: '确认接单',
					content: `确定接取「${item.companyName}」任务吗？`,
					success: (res) => {
						if (!res.confirm) return

						const pending = getPendingTasks()
						if (!pending.some(task => task.id === item.id)) {
							setPendingTasks([{
								...item,
								status: '进行中',
								statusType: 'processing'
							}, ...pending])
						}
						removeOrder(item.id)
						this.loadOrders()
						uni.showToast({
							title: '接单成功',
							icon: 'success'
						})
					}
				})
			},
			handleCall(item) {
				if (!item.phone) {
					uni.showToast({
						title: '暂无联系电话',
						icon: 'none'
					})
					return
				}
				uni.makePhoneCall({
					phoneNumber: item.phone,
					fail: () => {
						uni.showToast({
							title: '拨打失败',
							icon: 'none'
						})
					}
				})
			},
			handleComplete(item) {
				uni.navigateTo({
					url: `/pages/personalCenter/complete/index?id=${item.id}`
				})
			},
			handleCancelAccepted(item) {
				uni.navigateTo({
					url: `/pages/personalCenter/cancel/index?id=${item.id}`
				})
			},
			goDetail(item) {
				uni.navigateTo({
					url: `/pages/order/detail?id=${item.id}`
				})
			},
			handleProgress(item) {
				uni.navigateTo({
					url: `/pages/step/index?id=${item.id}`
				})
			},
			handleShowCode(item) {
				uni.showModal({
					title: '取件码',
					content: item.startCode || '暂无取件码',
					showCancel: false
				})
			},
			handleCancel(item) {
				uni.navigateTo({
					url: `/pages/order/cancel/index?id=${item.id}`
				})
			},
			handlePublish() {
				uni.navigateTo({
					url: '/pages/order/publish/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.order-page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.custom-title {
		padding: 12rpx 24rpx;
		color: #333333;
	}

	.banner-wrap {
		position: relative;
		width: 100%;
		height: 350rpx;
		overflow: hidden;
		background-color: #e8e8e8;
	}

	.banner-loading {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #e8f8f6;
		z-index: 1;
	}

	.banner-loading-text,
	.banner-error-text {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
	}

	.banner-error-text {
		color: #00a896;
	}

	.banner-img {
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 0.35s ease-in-out;

		&--visible {
			opacity: 1;
		}
	}

	.filter-wrap {
		padding: 0 24rpx;
		margin-top: 20rpx;
	}

	.order-list {
		padding: 0rpx 24rpx 160rpx;
	}

	.order-card {
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
		margin-bottom: 24rpx;
	}

	.company-name {
		flex: 1;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-right: 16rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status-tag {
		flex-shrink: 0;
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		border-width: 1rpx;
		border-style: solid;
	}

	.status-dispatched {
		color: #00a896;
		border-color: #00a896;
	}

	.status-dispatching {
		color: #007aff;
		border-color: #007aff;
	}
	
	.status-processing {
		color: #007aff;
		border-color: #007aff;
	}

	.card-body {
		display: flex;
		align-items: flex-start;
		margin-bottom: 20rpx;
	}

	.fault-icon {
		flex-shrink: 0;
		width: 88rpx;
		height: 88rpx;
		background-color: #00a896;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.fault-icon-text {
		font-size: 28rpx;
		color: #fff;
		font-weight: 500;
	}

	.info-list {
		flex: 1;
		min-width: 0;
	}

	.info-row {
		display: flex;
		align-items: flex-start;
		margin-bottom: 8rpx;
		font-size: 26rpx;
		line-height: 1.5;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.info-label {
		color: #999;
		flex-shrink: 0;
	}

	.info-value {
		color: #666;
		flex: 1;
	}

	.price-value {
		color: orange;
		font-weight: bold;
	}

	.take-code {
		color: #00a896;
		font-weight: bold;
	}

	.card-desc {
		font-size: 26rpx;
		line-height: 1.6;
		margin-bottom: 24rpx;
		padding-top: 4rpx;
	}

	.desc-label {
		color: #999;
	}

	.desc-text {
		color: #666;
	}

	.card-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.action-btn {
		font-size: 26rpx;
		padding: 10rpx 24rpx;
		border-radius: 30rpx;
		border-width: 1rpx;
		border-style: solid;
	}

	.action-primary {
		color: #00a896;
		border-color: #00a896;
	}

	.action-success {
		color: #fff;
		background-color: #00a896;
		border-color: #00a896;
	}

	.action-danger {
		color: #e64340;
		border-color: #e64340;
	}

	.no-order {
		width: 100%;
		text-align: center;
		margin-top: 24rpx;
	}
</style>