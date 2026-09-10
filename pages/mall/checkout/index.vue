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
				<view v-if="promoDiscount > 0" class="summary-row">
					<text class="summary-label">满减{{ promoText ? `（${promoText}）` : '' }}</text>
					<text class="summary-value summary-discount">-¥{{ formatMoney(promoDiscount) }}</text>
				</view>
				<view class="summary-row summary-row-click" @click="openCouponPicker">
					<text class="summary-label">优惠券</text>
					<view class="summary-coupon">
						<text class="summary-value" :class="{ 'summary-discount': couponDiscount > 0 }">{{ couponRowText }}</text>
						<up-icon name="arrow-right" size="12" color="#bbb"></up-icon>
					</view>
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
		<u-popup :show="couponShow" mode="bottom" round="16" closeOnClickOverlay @close="closeCouponPicker">
			<view class="coupon-popup">
				<view class="coupon-popup-header">
					<text class="coupon-popup-title">选择优惠券</text>
					<text class="coupon-popup-close" @click="closeCouponPicker">关闭</text>
				</view>
				<scroll-view scroll-y class="coupon-popup-list">
					<view class="coupon-none" @click="selectCoupon('')">
						<text>不使用优惠券</text>
						<text v-if="!userCouponId" class="coupon-picked">已选</text>
					</view>
					<view v-if="!couponOptions.length" class="coupon-empty">暂无可用优惠券</view>
					<view
						v-for="item in couponOptions"
						:key="item.id"
						class="coupon-card"
						:class="{ disabled: !item.usable }"
						@click="selectCoupon(item)"
					>
						<view class="coupon-amount">
							<text class="coupon-unit">¥</text>
							<text class="coupon-value">{{ formatCouponAmount(item.discountAmount) }}</text>
						</view>
						<view class="coupon-info">
							<text class="coupon-name">{{ item.name }}</text>
							<text class="coupon-limit">{{ couponThresholdText(item.thresholdAmount) }}</text>
							<text class="coupon-time">{{ item.expireText || item.disableReason || '永久有效' }}</text>
						</view>
						<text v-if="String(userCouponId) === String(item.id)" class="coupon-picked">已选</text>
						<text v-else-if="!item.usable" class="coupon-unusable">不可用</text>
					</view>
				</scroll-view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import { checkoutInfo, getDefaultContact, formatMoney } from './mock.js'
	import { getCartItems, getCartTotal, clearCartMap } from '../cart.js'
	import { assertStoreOpenForOrder, getStoreListApi, parseDeliveryFee } from '@/common/api/personalCenter/store.js'
	import { requireLogin, getUserInfo } from '@/common/auth.js'
	import {
		checkoutAndPayApi,
		mockConfirmMallPayApi,
		previewCheckoutApi,
		requestWxPayment,
		waitMallOrderPaid
	} from '@/common/api/mall/order.js'
	import { couponThresholdText } from '@/common/api/mall/promo.js'

	const defaultFormData = () => ({
		contact: '',
		address: '',
		remark: ''
	})

	export default {
		data() {
			return {
				checkoutInfo,
				deliveryFee: 0,
				cartItems: [],
				submitting: false,
				preview: null,
				userCouponId: '',
				couponCleared: false,
				couponShow: false,
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
				if (this.preview?.goodsAmount != null) {
					return Number(this.preview.goodsAmount)
				}
				return getCartTotal()
			},
			promoDiscount() {
				return Number(this.preview?.promoDiscount || 0)
			},
			promoText() {
				return String(this.preview?.promoText || '').trim()
			},
			couponDiscount() {
				return Number(this.preview?.couponDiscount || 0)
			},
			couponOptions() {
				return Array.isArray(this.preview?.coupons) ? this.preview.coupons : []
			},
			couponRowText() {
				if (this.couponDiscount > 0) {
					return `-¥${formatMoney(this.couponDiscount)}`
				}
				const usable = this.couponOptions.filter((item) => item.usable).length
				if (usable > 0) {
					return `${usable}张可用`
				}
				return '未使用'
			},
			payTotal() {
				if (this.preview?.payAmount != null) {
					return Number(this.preview.payAmount)
				}
				return this.goodsTotal + this.deliveryFee
			}
		},
		async onLoad() {
			if (!(await requireLogin({ force: true }))) return
			this.loadCheckoutData()
		},
		methods: {
			formatMoney,
			resolveCheckoutStoreId() {
				const item = this.cartItems.find((row) => row.storeId)
				return item?.storeId || ''
			},
			loadCheckoutData() {
				this.cartItems = getCartItems()
				if (!this.cartItems.length) return
				const defaults = getDefaultContact()
				const phone = String(getUserInfo()?.phone || '').trim()
				this.formData = {
					...defaultFormData(),
					...defaults,
					contact: phone || defaults.contact || ''
				}
				this.loadDeliveryFee()
				this.refreshPreview({ autoPick: true })
			},
			async loadDeliveryFee() {
				const storeId = this.resolveCheckoutStoreId()
				if (!storeId) {
					this.deliveryFee = 0
					return
				}
				try {
					const data = await getStoreListApi({
						storeId,
						pageNum: 1,
						pageSize: 1
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					this.deliveryFee = parseDeliveryFee(list[0])
				} catch (error) {
					console.error('获取店铺配送费失败', error)
					this.deliveryFee = 0
				}
			},
			buildCheckoutItems() {
				return this.cartItems.map((item) => ({
					productId: item.productId || item.id,
					quantity: Number(item.count || 0)
				}))
			},
			buildCheckoutPayload() {
				const payload = {
					contact: this.formData.contact,
					address: this.formData.address,
					remark: this.formData.remark || '',
					items: this.buildCheckoutItems()
				}
				if (this.userCouponId) {
					payload.userCouponId = this.userCouponId
				}
				return payload
			},
			couponThresholdText,
			formatCouponAmount(value) {
				const n = Number(value || 0)
				return Number.isFinite(n) ? String(n) : '0'
			},
			openCouponPicker() {
				this.couponShow = true
			},
			closeCouponPicker() {
				this.couponShow = false
			},
			async selectCoupon(item) {
				if (item && item.usable === false) {
					uni.showToast({ title: item.disableReason || '暂不可用', icon: 'none' })
					return
				}
				const nextId = item && item.id ? String(item.id) : ''
				this.userCouponId = nextId
				this.couponCleared = !nextId
				this.couponShow = false
				await this.refreshPreview()
			},
			async refreshPreview({ autoPick = false } = {}) {
				if (!this.cartItems.length) return
				try {
					const payload = { items: this.buildCheckoutItems() }
					if (this.userCouponId) {
						payload.userCouponId = this.userCouponId
					}
					const data = await previewCheckoutApi(payload)
					this.preview = data || null
					if (data?.deliveryFee != null) {
						this.deliveryFee = Number(data.deliveryFee)
					}
					if (data?.couponError) {
						this.userCouponId = ''
						uni.showToast({ title: data.couponError, icon: 'none' })
					} else if (data?.userCouponId) {
						this.userCouponId = String(data.userCouponId)
					}
					if (autoPick && !this.userCouponId && !this.couponCleared) {
						const best = (data?.coupons || []).find((row) => row.usable)
						if (best?.id) {
							this.userCouponId = String(best.id)
							await this.refreshPreview()
						}
					}
				} catch (error) {
					console.error('结算预览失败', error)
				}
			},
			async doPayFlow() {
				const payParams = await checkoutAndPayApi(this.buildCheckoutPayload())
				const orderNo = payParams?.orderNo
				if (!orderNo) {
					throw new Error('下单失败：未返回订单号')
				}

				if (payParams.mock) {
					await mockConfirmMallPayApi(orderNo)
				} else {
					try {
						await requestWxPayment(payParams)
					} catch (err) {
						const msg = err?.errMsg || ''
						if (msg.includes('cancel') || msg.includes('取消')) {
							uni.showToast({ title: '已取消支付', icon: 'none' })
							return false
						}
						throw err instanceof Error ? err : new Error(msg || '支付失败')
					}
					const result = await waitMallOrderPaid(orderNo)
					if (Number(result?.order?.payStatus) !== 1) {
						uni.showToast({
							title: '支付结果确认中，请稍后在订单中查看',
							icon: 'none'
						})
						return false
					}
				}

				clearCartMap()
				uni.showToast({ title: '支付成功', icon: 'success' })
				setTimeout(() => {
					uni.navigateBack()
				}, 1200)
				return true
			},
			async handleSubmit() {
				if (this.submitting) return
				if (!(await requireLogin({ force: true }))) return
				if (!this.cartItems.length) {
					uni.showToast({ title: '购物车是空的', icon: 'none' })
					return
				}
				try {
					await this.$refs.formRef.validate()
				} catch (e) {
					return
				}

				const check = await assertStoreOpenForOrder(this.resolveCheckoutStoreId())
				if (!check.ok) return

				uni.showModal({
					title: '确认下单',
					content: `确定支付 ¥${formatMoney(this.payTotal)} 吗？`,
					success: async (res) => {
						if (!res.confirm) return
						const recheck = await assertStoreOpenForOrder(this.resolveCheckoutStoreId())
						if (!recheck.ok) return
						this.submitting = true
						try {
							await this.doPayFlow()
						} catch (e) {
							// 业务错误由 request.js toast；取消支付已在 doPayFlow 提示
							console.error('商城结算失败', e)
						} finally {
							this.submitting = false
						}
					}
				})
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

	.summary-discount {
		color: #ff6034;
	}

	.summary-row-click {
		cursor: pointer;
	}

	.summary-coupon {
		display: flex;
		align-items: center;
		gap: 8rpx;
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

	.coupon-popup {
		background-color: #fff;
		border-radius: 16rpx 16rpx 0 0;
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.coupon-popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.coupon-popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.coupon-popup-close {
		font-size: 26rpx;
		color: #999;
	}

	.coupon-popup-list {
		max-height: 50vh;
		padding: 16rpx 32rpx 24rpx;
		box-sizing: border-box;
	}

	.coupon-none {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 8rpx 16rpx;
		font-size: 28rpx;
		color: #333;
	}

	.coupon-empty {
		padding: 40rpx 0;
		text-align: center;
		font-size: 26rpx;
		color: #999;
	}

	.coupon-card {
		display: flex;
		align-items: center;
		padding: 24rpx 20rpx;
		margin-bottom: 16rpx;
		background-color: #fff7f5;
		border-radius: 12rpx;
		border: 1rpx dashed #ffd0c4;
	}

	.coupon-card.disabled {
		opacity: 0.55;
		background-color: #f7f7f7;
		border-color: #e5e5e5;
	}

	.coupon-amount {
		flex-shrink: 0;
		width: 140rpx;
		display: flex;
		align-items: baseline;
		justify-content: center;
		color: #ff6034;
	}

	.coupon-unit {
		font-size: 24rpx;
		font-weight: 600;
	}

	.coupon-value {
		font-size: 44rpx;
		font-weight: 700;
	}

	.coupon-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		padding: 0 16rpx;
	}

	.coupon-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
	}

	.coupon-limit,
	.coupon-time {
		font-size: 22rpx;
		color: #999;
	}

	.coupon-picked {
		flex-shrink: 0;
		font-size: 24rpx;
		color: #00a896;
		font-weight: 600;
	}

	.coupon-unusable {
		flex-shrink: 0;
		font-size: 22rpx;
		color: #999;
	}
</style>
