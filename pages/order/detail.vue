<template>
	<view class="detail-page">
		<view class="detail-card">
			<!-- 工单状态 -->
			<view class="detail-row">
				<text class="row-label">工单状态</text>
				<text class="status-tag">{{ detail.status }}</text>
			</view>

			<!-- 工单编码 -->
			<view class="detail-row">
				<text class="row-label">工单编码</text>
				<text class="row-value">{{ detail.orderCode }}</text>
			</view>

			<!-- 报修人 -->
			<view class="detail-row">
				<text class="row-label">报修人</text>
				<text class="row-value">{{ detail.reporter }}</text>
			</view>

			<!-- 联系电话 -->
			<view class="detail-row">
				<text class="row-label">联系电话</text>
				<view class="row-value phone-wrap">
					<text>{{ detail.phone }}</text>
					<text class="call-link" @click="handleCall">一键拨打</text>
				</view>
			</view>

			<!-- 上报单位 -->
			<view class="detail-row">
				<text class="row-label">上报单位</text>
				<text class="row-value">{{ detail.companyName }}</text>
			</view>

			<!-- 上报地址 -->
			<view class="detail-row">
				<text class="row-label">上报地址</text>
				<text class="row-value">{{ detail.address }}</text>
			</view>

			<!-- 报修设备 -->
			<view class="detail-row">
				<text class="row-label">报修设备</text>
				<text class="row-value">{{ detail.equipment }}</text>
			</view>

			<!-- 报修类型 -->
			<view class="detail-row">
				<text class="row-label">报修类型</text>
				<text class="row-value">{{ detail.repairType }}</text>
			</view>

			<!-- 故障描述 -->
			<view class="detail-row detail-row-block">
				<text class="row-label">故障描述</text>
				<view class="desc-box">
					<text class="desc-content">{{ detail.description }}</text>
				</view>
			</view>

			<!-- 维修人 -->
			<view class="detail-row detail-row-last">
				<text class="row-label">维修人</text>
				<text class="row-value">{{ detail.repairer }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getOrderById } from './mock.js'

export default {
	data() {
		return {
			detail: {
				status: '',
				orderCode: '',
				reporter: '',
				phone: '',
				companyName: '',
				address: '',
				equipment: '',
				repairType: '',
				description: '',
				repairer: ''
			}
		}
	},
	onLoad(options) {
		const order = getOrderById(options.id || '1')
		this.detail = {
			...order,
			status: '抢修结束'
		}
	},
	methods: {
		handleCall() {
			uni.makePhoneCall({
				phoneNumber: this.detail.phone,
				fail: () => {
					uni.showToast({
						title: '拨打失败，请手动拨打',
						icon: 'none'
					})
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.detail-page {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 20rpx 0;
}

.detail-card {
	background-color: #fff;
}

.detail-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 30rpx;
	border-bottom: 1rpx solid #eee;
	min-height: 48rpx;
}

.detail-row-block {
	flex-direction: column;
	align-items: flex-start;
}

.detail-row-last {
	border-bottom: none;
}

.row-label {
	font-size: 28rpx;
	color: #333;
	flex-shrink: 0;
	margin-right: 24rpx;
}

.row-value {
	flex: 1;
	font-size: 28rpx;
	color: #666;
	text-align: right;
	word-break: break-all;
}

.phone-wrap {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 16rpx;
}

.call-link {
	color: #007aff;
	font-size: 28rpx;
	flex-shrink: 0;
}

.status-tag {
	font-size: 26rpx;
	color: #007aff;
	border: 1rpx solid #007aff;
	border-radius: 8rpx;
	padding: 6rpx 20rpx;
}

.desc-box {
	width: 100%;
	margin-top: 16rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;
	padding: 20rpx;
	box-sizing: border-box;
}

.desc-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}
</style>
