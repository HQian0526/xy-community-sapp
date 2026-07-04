<template>
	<view class="checkout-page">
		<view v-if="!cartItems.length" class="empty-wrap">
			<u-empty text="购物车是空的" mode="car"></u-empty>
		</view>

		<template v-else>
			<view class="form-card">
				<uni-forms ref="formRef" :model="formData" :rules="rules" label-width="160rpx">
					<uni-forms-item label="联系电话" name="contact" required>
						<uni-easyinput
							v-model="formData.contact"
							type="number"
							maxlength="11"
							placeholder="请输入手机号码"
							:inputBorder="false"
						/>
					</uni-forms-item>

					<uni-forms-item label="收货地址" name="address" required>
						<uni-easyinput
							v-model="formData.address"
							type="textarea"
							autoHeight
							placeholder="请输入详细收货地址"
							:inputBorder="false"
						/>
					</uni-forms-item>

					<uni-forms-item label="备注" name="remark">
						<uni-easyinput
							v-model="formData.remark"
							type="textarea"
							autoHeight
							placeholder="选填，可补充配送说明"
							:inputBorder="false"
						/>
					</uni-forms-item>
				</uni-forms>
			</view>

			<view class="goods-card">
				<view class="card-header">
					<text class="card-title">{{ checkoutInfo.storeName }}</text>
					<text class="card-tip">{{ checkoutInfo.deliveryTip }}</text>
				</view>
				<view v-for="item in cartItems" :key="item.id" class="goods-item">
					<image class="goods-img" :src="item.icon || '/static/image-wrong.png'" mode="aspectFill" />
					<view class="goods-info">
						<text class="goods-name">{{ item.name }}</text>
						<view class="goods-bottom">
							<view class="goods-price">
								<text class="price-symbol">¥</text>
								<text class="price-value">{{ formatMoney(item.price) }}</text>
							</view>
							<text class="goods-count">x{{ item.count }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="summary-card">
				<view class="summary-row">
					<text class="summary-label">商品金额</text>
					<text class="summary-value">¥{{ formatMoney(goodsTotal) }}</text>
				</view>
				<view class="summary-row">
					<text class="summary-label">配送费</text>
					<text class="summary-value">¥{{ formatMoney(deliveryFee) }}</text>
				</view>
				<view class="summary-row summary-row-total">
					<text class="summary-label">合计</text>
					<text class="summary-total">¥{{ formatMoney(payTotal) }}</text>
				</view>
			</view>

			<view class="submit-bar">
				<view class="submit-total">
					<text class="submit-label">应付</text>
					<text class="submit-amount">¥{{ formatMoney(payTotal) }}</text>
				</view>
				<view class="btn-success submit-btn" @click="handleSubmit">提交订单</view>
			</view>
		</template>
	</view>
</template>

<script>
	import { checkoutInfo, DELIVERY_FEE, getDefaultContact, formatMoney } from './mock.js'
	import { getCartItems, getCartTotal, clearCartMap } from '../cart.js'
	import { addStoreOrder } from '../../personalCenter/storeOrder/mock.js'

	const defaultFormData = () => ({
		contact: '',
		address: '',
		remark: ''
	})

	export default {
		data() {
			return {
				checkoutInfo,
				deliveryFee: DELIVERY_FEE,
				cartItems: [],
				formData: defaultFormData(),
				rules: {
					contact: {
						rules: [
							{ required: true, errorMessage: '请输入联系电话' },
							{ pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号码格式不正确' }
						]
					},
					address: {
						rules: [{ required: true, errorMessage: '请输入收货地址' }]
					}
				}
			}
		},
		computed: {
			goodsTotal() {
				return getCartTotal()
			},
			payTotal() {
				return this.goodsTotal + this.deliveryFee
			}
		},
		onLoad() {
			this.loadCheckoutData()
		},
		methods: {
			formatMoney,
			loadCheckoutData() {
				this.cartItems = getCartItems()
				if (!this.cartItems.length) return
				const defaults = getDefaultContact()
				this.formData = {
					...defaultFormData(),
					...defaults
				}
			},
			handleSubmit() {
				if (!this.cartItems.length) {
					uni.showToast({ title: '购物车是空的', icon: 'none' })
					return
				}
				this.$refs.formRef.validate().then(() => {
					uni.showModal({
						title: '确认下单',
						content: `确定支付 ¥${formatMoney(this.payTotal)} 吗？`,
						success: (res) => {
							if (!res.confirm) return
							addStoreOrder({
								address: this.formData.address,
								contact: this.formData.contact,
								remark: this.formData.remark,
								goods: this.cartItems.map(item => ({
									id: item.id,
									name: item.name,
									price: item.price,
									count: item.count,
									icon: item.icon || ''
								})),
								goodsTotal: this.goodsTotal,
								deliveryFee: this.deliveryFee,
								payTotal: this.payTotal
							})
							clearCartMap()
							uni.showToast({
								title: '下单成功',
								icon: 'success'
							})
							setTimeout(() => {
								uni.navigateBack()
							}, 1200)
						}
					})
				}).catch(() => {})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.checkout-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.empty-wrap {
		padding-top: 200rpx;
	}

	.form-card,
	.goods-card,
	.summary-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 8rpx 24rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.goods-card {
		padding: 24rpx;
	}

	.card-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 20rpx;
		padding-bottom: 16rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.card-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.card-tip {
		font-size: 22rpx;
		color: #999;
	}

	.goods-item {
		display: flex;
		align-items: flex-start;
		padding: 16rpx 0;

		& + .goods-item {
			border-top: 1rpx solid #f5f5f5;
		}
	}

	.goods-img {
		flex-shrink: 0;
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		background-color: #f8f8f8;
	}

	.goods-info {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 120rpx;
	}

	.goods-name {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.goods-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 12rpx;
	}

	.goods-price {
		display: flex;
		align-items: baseline;
	}

	.price-symbol {
		font-size: 22rpx;
		color: #ff6034;
		font-weight: 600;
	}

	.price-value {
		font-size: 30rpx;
		color: #ff6034;
		font-weight: 700;
	}

	.goods-count {
		font-size: 26rpx;
		color: #999;
	}

	.summary-card {
		padding: 24rpx;
	}

	.summary-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
		font-size: 28rpx;
	}

	.summary-row-total {
		margin-bottom: 0;
		padding-top: 16rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.summary-label {
		color: #666;
	}

	.summary-value {
		color: #333;
	}

	.summary-total {
		font-size: 36rpx;
		font-weight: 700;
		color: #ff6034;
	}

	.submit-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.submit-total {
		display: flex;
		align-items: baseline;
		gap: 8rpx;
	}

	.submit-label {
		font-size: 26rpx;
		color: #666;
	}

	.submit-amount {
		font-size: 40rpx;
		font-weight: 700;
		color: #ff6034;
	}

	.submit-btn {
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 48rpx;
		font-size: 30rpx;
		font-weight: 600;
	}
</style>
