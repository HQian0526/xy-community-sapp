<template>
	<view class="pending-page">
		<view v-if="taskList.length" class="task-list">
			<view v-for="item in taskList" :key="item.id" class="task-card" @click="goDetail(item)">
				<view class="card-header">
					<text class="company-name">{{ item.companyName }}</text>
					<text class="status-tag" :class="'status-' + item.statusType">{{ item.status }}</text>
				</view>

				<view class="card-body">
					<view class="fault-icon">
						<text class="fault-icon-text">{{ item.faultType }}</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">接单时间：</text>
							<text class="info-value">{{ item.submitTime }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">任务酬金：</text>
							<text class="info-value price-value">{{ item.price }}元</text>
						</view>
						<view v-if="item.faultType === '取件'" class="info-row">
							<text class="info-label take-code">取件码：</text>
							<text class="info-value take-code">{{ item.startCode }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">任务地址：</text>
							<text class="info-value">{{ item.address }}</text>
						</view>
					</view>
				</view>

				<view class="card-desc">
					<text class="desc-label">任务详情：</text>
					<text class="desc-text">{{ item.description }}</text>
				</view>

				<view class="card-actions" @click.stop>
					<!-- <text class="action-btn action-primary" @click="handleProgress(item)">进度查询</text> -->
					<!-- <text
						v-if="item.faultType === '取件'"
						class="action-btn action-primary"
						@click="handleShowCode(item)"
					>
						查看取件码
					</text> -->
					<text class="action-btn action-primary" @click="handleCall(item)">联系客户</text>
					<text class="action-btn action-success" @click="handleComplete(item)">确认完成</text>
					<text class="action-btn action-danger" @click="handleCancel(item)">取消工单</text>
				</view>
			</view>
			<view class="list-footer">已经到底了～</view>
		</view>

		<view v-else class="empty-wrap">
			<u-empty text="暂无待处理任务" mode="list"></u-empty>
		</view>
	</view>
</template>

<script>
	import {
		getPendingTasks
	} from './mock.js'

	export default {
		data() {
			return {
				taskList: []
			}
		},
		onShow() {
			this.loadTasks()
		},
		methods: {
			loadTasks() {
				this.taskList = getPendingTasks()
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
			handleCall(item) {
				if (!item.phone) {
					uni.showToast({ title: '暂无联系电话', icon: 'none' })
					return
				}
				uni.makePhoneCall({
					phoneNumber: item.phone,
					fail: () => {
						uni.showToast({ title: '拨打失败', icon: 'none' })
					}
				})
			},
			handleComplete(item) {
				uni.navigateTo({
					url: `/pages/personalCenter/complete/index?id=${item.id}`
				})
			},
			handleCancel(item) {
				uni.navigateTo({
					url: `/pages/personalCenter/cancel/index?id=${item.id}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.pending-page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.task-list {
		padding: 24rpx 24rpx 40rpx;
	}

	.task-card {
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

	.status-processing {
		color: $primary;
		border-color: $primary;
	}

	.status-waiting {
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
		background-color: $primary;
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
		color: $primary;
		border-color: $primary;
	}

	.action-success {
		color: #fff;
		background-color: $primary;
		border-color: $primary;
	}

	.action-danger {
		color: #e64340;
		border-color: #e64340;
	}

	.list-footer {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		padding: 24rpx 0;
	}

	.empty-wrap {
		padding-top: 200rpx;
	}
</style>
