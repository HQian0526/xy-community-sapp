<template>
	<view class="order-page">
		<u-title class="custom-title">
			<u-icon name="map" size="18"></u-icon>
			<text>{{socialName || '位置获取失败，请点击此处手动绑定'}}</text>
		</u-title>
		<!-- Banner 预留区域 -->
		<view class="banner-wrap">
			<image class="banner-img" src="http://106.55.6.194:8999/xy-community/banner.png" mode="contain" />
		</view>

		<!-- 分段器 -->
		<view class="p-24 mt-24">
			<up-subsection mode="button" :list="sectionList" :current="currentSection" activeColor="#00a896" inactiveColor="#ffffff"
				bgColor="#00a896"></up-subsection>
		</view>
		<!-- 可接单列表 -->
		<view v-if="orderList && orderList.length > 0" class="order-list">
			<view v-for="item in orderList" :key="item.id" class="order-card" @click="goDetail(item)">
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
							<text class="info-value" style="color: orange; font-weight: bold">{{ item.price }}元</text>
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
					<text class="action-btn action-primary" @click="handleProgress(item)">进度查询</text>
					<text v-if="item.faultType === '取件'" class="action-btn action-primary" @click="handleShowCode(item)">查看取件码</text>
					<text class="action-btn action-danger" @click="handleCancel(item)">取消工单</text>
				</view>
			</view>
			<view class="flex-center" style="color: #999999">
				已经到底了～
			</view>
		</view>

		<view v-else>
			<view class="no-order" style="color: #999999">暂无可接任务~</view>
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
		orderList
	} from './mock.js'

	export default {
		data() {
			return {
				orderList,
				socialName: '上海-汤臣一品',
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
				currentSection: 1,
				sectionList: [{
						name: '可接任务'
					},
					{
						name: '已接任务'
					},
				],
			}
		},
		onBackPress() {
			if (this.$refs.fab && this.$refs.fab.isShow) {
				this.$refs.fab.close()
				return true
			}
			return false
		},
		methods: {
			goDetail(item) {
				uni.navigateTo({
					url: `/views/order/detail?id=${item.id}`
				})
			},
			handleProgress(item) {
				uni.showToast({
					title: `工单 ${item.orderCode} 进度查询`,
					icon: 'none'
				})
			},
			handleShowCode(item) {
				uni.showToast({
					title: `开工码：${item.startCode}`,
					icon: 'none'
				})
			},
			handleCancel(item) {
				uni.showModal({
					title: '提示',
					content: '确定要取消该工单吗？',
					success: (res) => {
						if (res.confirm) {
							uni.showToast({
								title: '已取消工单',
								icon: 'none'
							})
						}
					}
				})
			},
			handlePublish() {
				uni.showToast({
					title: '发布求助',
					icon: 'none'
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
		width: 100%;
		height: 350rpx;
		overflow: hidden;
		background-color: #e8e8e8;
	}

	.banner-img {
		width: 100%;
		height: 100%;
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