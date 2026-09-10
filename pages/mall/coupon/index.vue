<template>
	<view class="coupon-page">
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

		<view v-if="list.length" class="coupon-list">
			<view
				v-for="item in list"
				:key="item.id"
				class="ticket"
				:class="{ 'ticket--disabled': currentSection !== 0 }"
				@click="handleCouponTap(item)"
			>
				<view class="ticket-notch ticket-notch--top"></view>
				<view class="ticket-notch ticket-notch--bottom"></view>

				<view class="ticket-left">
					<view class="ticket-price">
						<text class="ticket-unit">¥</text>
						<text class="ticket-value">{{ formatAmount(item.discountAmount) }}</text>
					</view>
					<text class="ticket-threshold">{{ couponThresholdText(item.thresholdAmount) }}</text>
				</view>

				<view class="ticket-dash"></view>

				<view class="ticket-right">
					<view class="ticket-head">
						<text class="ticket-name">{{ item.name }}</text>
						<text class="ticket-badge">店铺券</text>
					</view>
					<view class="ticket-store">
						<up-icon name="home" size="12" color="#8a8a8a"></up-icon>
						<text class="ticket-store-name">{{ item.storeName || '店铺优惠券' }}</text>
					</view>
					<view class="ticket-meta">
						<up-icon name="clock" size="12" color="#8a8a8a"></up-icon>
						<text class="ticket-time">{{ expireLabel(item) }}</text>
					</view>
					<view class="ticket-foot">
						<text class="ticket-tip">仅抵商品金额，不抵配送费</text>
						<text v-if="currentSection === 0" class="ticket-use">去使用</text>
						<text v-else class="ticket-stamp">{{ statusStamp(item) }}</text>
					</view>
				</view>
			</view>
			<view class="list-footer">已经到底了～</view>
		</view>

		<view v-else class="empty-wrap">
			<u-empty :text="emptyText" mode="coupon"></u-empty>
		</view>
	</view>
</template>

<script>
	import { requireLogin } from '@/common/auth.js'
	import { findMyCouponsApi } from '@/common/api/mall/coupon.js'
	import { couponThresholdText } from '@/common/api/mall/promo.js'

	const TABS = ['unused', 'used', 'expired']

	export default {
		data() {
			return {
				currentSection: 0,
				sectionList: [
					{ name: '未使用' },
					{ name: '已使用' },
					{ name: '已过期' }
				],
				list: []
			}
		},
		computed: {
			emptyText() {
				return ['暂无未使用优惠券', '暂无已使用优惠券', '暂无已过期优惠券'][this.currentSection] || '暂无优惠券'
			}
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			this.loadCoupons()
		},
		onPullDownRefresh() {
			this.loadCoupons().finally(() => uni.stopPullDownRefresh())
		},
		methods: {
			couponThresholdText,
			formatAmount(value) {
				const n = Number(value || 0)
				if (!Number.isFinite(n)) return '0'
				return String(n)
			},
			expireLabel(item) {
				if (!item) return '永久有效'
				if (Number(item.forever) === 1 || !item.expireTime) {
					return item.expireText || '永久有效'
				}
				const text = String(item.expireText || item.expireTime || '').trim()
				return text ? `有效期至 ${text}` : '永久有效'
			},
			statusStamp(item) {
				if (this.currentSection === 2) return '已过期'
				if (Number(item?.status) === 1) return '占用中'
				return '已使用'
			},
			handleSectionChange(index) {
				this.currentSection = index
				this.loadCoupons()
			},
			handleCouponTap() {
				if (this.currentSection !== 0) return
				uni.switchTab({
					url: '/pages/mall/index'
				})
			},
			async loadCoupons() {
				try {
					const data = await findMyCouponsApi({
						tab: TABS[this.currentSection] || 'unused',
						pageNum: 1,
						pageSize: 100
					})
					this.list = data?.list || []
				} catch (e) {
					console.error('加载优惠券失败', e)
					this.list = []
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;
	$page-bg: #f5f5f5;

	.coupon-page {
		min-height: 100vh;
		background-color: $page-bg;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.filter-wrap {
		margin-bottom: 24rpx;
	}

	.coupon-list {
		padding-bottom: 40rpx;
	}

	.ticket {
		position: relative;
		display: flex;
		min-height: 200rpx;
		margin-bottom: 24rpx;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(0, 168, 150, 0.08);
	}

	.ticket-notch {
		position: absolute;
		left: 196rpx;
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		background-color: $page-bg;
		z-index: 2;
	}

	.ticket-notch--top {
		top: -12rpx;
	}

	.ticket-notch--bottom {
		bottom: -12rpx;
	}

	.ticket-left {
		flex-shrink: 0;
		width: 208rpx;
		padding: 28rpx 16rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(165deg, #1ac2ae 0%, $primary 72%);
		color: #fff;
	}

	.ticket-price {
		display: flex;
		align-items: flex-end;
		line-height: 1;
	}

	.ticket-unit {
		font-size: 28rpx;
		font-weight: 600;
		margin-bottom: 8rpx;
	}

	.ticket-value {
		font-size: 64rpx;
		font-weight: 700;
		letter-spacing: -2rpx;
	}

	.ticket-threshold {
		margin-top: 12rpx;
		padding: 4rpx 14rpx;
		border-radius: 20rpx;
		background-color: rgba(255, 255, 255, 0.2);
		font-size: 20rpx;
	}

	.ticket-dash {
		width: 0;
		border-left: 2rpx dashed rgba(0, 168, 150, 0.28);
		margin: 24rpx 0;
	}

	.ticket-right {
		flex: 1;
		min-width: 0;
		padding: 24rpx 24rpx 20rpx 20rpx;
		display: flex;
		flex-direction: column;
	}

	.ticket-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12rpx;
	}

	.ticket-name {
		flex: 1;
		min-width: 0;
		font-size: 30rpx;
		font-weight: 700;
		color: #222;
		line-height: 1.35;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.ticket-badge {
		flex-shrink: 0;
		padding: 4rpx 10rpx;
		border-radius: 8rpx;
		background-color: rgba(0, 168, 150, 0.12);
		color: $primary;
		font-size: 20rpx;
		font-weight: 600;
	}

	.ticket-store,
	.ticket-meta {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-top: 10rpx;
	}

	.ticket-store-name,
	.ticket-time {
		flex: 1;
		min-width: 0;
		font-size: 22rpx;
		color: #8a8a8a;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.ticket-foot {
		margin-top: auto;
		padding-top: 16rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
		border-top: 1rpx dashed #eee;
	}

	.ticket-tip {
		flex: 1;
		min-width: 0;
		font-size: 20rpx;
		color: #bbb;
	}

	.ticket-use {
		flex-shrink: 0;
		padding: 8rpx 20rpx;
		border-radius: 28rpx;
		background-color: $primary;
		color: #fff;
		font-size: 22rpx;
		font-weight: 600;
	}

	.ticket-stamp {
		flex-shrink: 0;
		padding: 6rpx 14rpx;
		border: 2rpx solid #c9c9c9;
		border-radius: 8rpx;
		color: #999;
		font-size: 22rpx;
		font-weight: 700;
		transform: rotate(-8deg);
	}

	.ticket--disabled {
		box-shadow: none;
		filter: grayscale(0.35);

		.ticket-left {
			background: linear-gradient(165deg, #cfd3d3 0%, #b7bcbc 72%);
		}

		.ticket-dash {
			border-left-color: #ddd;
		}

		.ticket-badge {
			background-color: #f0f0f0;
			color: #999;
		}

		.ticket-name {
			color: #666;
		}
	}

	.list-footer {
		padding: 8rpx 0 40rpx;
		text-align: center;
		font-size: 24rpx;
		color: #bbb;
	}

	.empty-wrap {
		padding-top: 120rpx;
	}
</style>
