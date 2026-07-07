<template>
	<view class="business-page">
		<view v-if="businessList.length" class="business-list">
			<view v-for="item in businessList" :key="item.id" class="business-card">
				<view class="card-main">
					<text class="business-name">{{ item.name }}</text>
					<text v-if="item.description" class="business-desc">{{ item.description }}</text>
					<text class="business-fee">收费标准：{{ item.fee }}</text>
				</view>
				<view class="card-actions">
					<text class="action-btn action-primary" @click="handleEdit(item)">编辑</text>
					<text class="action-btn action-danger" @click="handleDelete(item)">删除</text>
				</view>
			</view>
			<view class="list-footer">已经到底了～</view>
		</view>

		<view v-else class="empty-wrap">
			<u-empty text="暂无业务项，请新增" mode="list"></u-empty>
		</view>

		<view class="submit-wrap">
			<view class="btn-success submit-btn" @click="handleAdd">新增业务</view>
		</view>
	</view>
</template>

<script>
	import {
		getOtherBusinessList,
		deleteOtherBusiness
	} from './mock.js'

	export default {
		data() {
			return {
				businessList: []
			}
		},
		onShow() {
			this.loadList()
		},
		methods: {
			loadList() {
				this.businessList = getOtherBusinessList()
			},
			handleAdd() {
				uni.navigateTo({
					url: '/pages/personalCenter/otherBusinessSetting/form/index'
				})
			},
			handleEdit(item) {
				uni.navigateTo({
					url: `/pages/personalCenter/otherBusinessSetting/form/index?id=${item.id}`
				})
			},
			handleDelete(item) {
				uni.showModal({
					title: '确认删除',
					content: `确定删除「${item.name}」吗？`,
					success: (res) => {
						if (!res.confirm) return
						this.businessList = deleteOtherBusiness(item.id)
						uni.showToast({
							title: '已删除',
							icon: 'success'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.business-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.business-list {
		padding-bottom: 24rpx;
	}

	.business-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.card-main {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		margin-bottom: 20rpx;
	}

	.business-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.business-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}

	.business-fee {
		font-size: 26rpx;
		color: #ff6034;
		font-weight: 500;
	}

	.card-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid #f5f5f5;
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
		padding-top: 160rpx;
	}

	.submit-wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 24rpx 48rpx calc(24rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.submit-btn {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: 600;
	}
</style>
