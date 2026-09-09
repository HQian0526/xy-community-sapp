<template>
	<view class="cart-page">
		<view v-if="!cartItems.length" class="empty-wrap">
			<u-empty text="购物车是空的" mode="car"></u-empty>
			<view class="empty-btn" @click="goMall">去逛店</view>
		</view>

		<template v-else>
			<view class="cart-header">
				<text class="cart-count">共 {{ cartCount }} 件</text>
				<text class="cart-clear" @click="handleClear">清空</text>
			</view>

			<view class="cart-list">
				<view
					v-for="item in cartItems"
					:key="item.id"
					class="cart-item"
					@click="goProductDetail(item)"
				>
					<image class="cart-img" :src="item.icon || '/static/image-wrong.png'" mode="aspectFill" />
					<view class="cart-info">
						<text class="cart-name">{{ item.name }}</text>
						<text v-if="item.offShelf" class="cart-invalid">已下架</text>
						<view class="cart-bottom">
							<view class="cart-price">
								<text class="price-symbol">¥</text>
								<text class="price-value">{{ formatMoney(item.price) }}</text>
							</view>
							<view class="stepper" @click.stop>
								<view class="stepper-btn" @click="handleMinus(item)">
									<up-icon name="minus" size="12" color="#666"></up-icon>
								</view>
								<text class="stepper-count">{{ item.count }}</text>
								<view
									class="stepper-btn stepper-btn--plus"
									:class="{ disabled: item.offShelf }"
									@click="handlePlus(item)"
								>
									<up-icon name="plus" size="12" color="#fff"></up-icon>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="bottom-placeholder"></view>
			<view class="action-bar">
				<view class="action-sum">
					<view class="sum-row">
						<text class="sum-label">合计</text>
						<text class="sum-value">¥{{ formatMoney(goodsTotal) }}</text>
					</view>
					<text class="sum-tip">另需配送费 ¥{{ formatMoney(deliveryFee) }}</text>
				</view>
				<view class="action-btn" @click="handleCheckout">去结算</view>
			</view>
		</template>

		<bind-phone-popup ref="bindPhonePopup" />
	</view>
</template>

<script>
	import bindPhoneMixin from '@/common/mixin/bindPhoneMixin.js'
	import BindPhonePopup from '@/components/bind-phone-popup/bind-phone-popup.vue'
	import { requireLogin, ensurePhoneBound } from '@/common/auth.js'
	import { getProductListApi } from '@/common/api/mall/product.js'
	import {
		assertStoreOpenForOrder,
		getStoreListApi,
		parseDeliveryFee
	} from '@/common/api/personalCenter/store.js'
	import { resolveFileUrl } from '@/common/api/config.js'
	import { formatMoney } from '../checkout/mock.js'
	import {
		getCartMap,
		getCartItems,
		getCartCount,
		getCartTotal,
		clearCartMap,
		rememberCartProduct,
		setCartItemCount,
		setCartMap
	} from '../cart.js'

	function firstImage(raw) {
		const first = String(raw || '').split(',')[0].trim()
		return resolveFileUrl(first)
	}

	export default {
		mixins: [bindPhoneMixin],
		components: {
			BindPhonePopup
		},
		data() {
			return {
				cartMap: {},
				deliveryFee: 0
			}
		},
		computed: {
			cartItems() {
				return getCartItems(this.cartMap)
			},
			cartCount() {
				return getCartCount(this.cartMap)
			},
			goodsTotal() {
				return getCartTotal(this.cartMap)
			}
		},
		onShow() {
			this.reloadCart()
			this.refreshCartProducts()
			this.loadDeliveryFee()
		},
		methods: {
			formatMoney,
			reloadCart() {
				this.cartMap = getCartMap()
			},
			resolveStoreId() {
				const hit = this.cartItems.find((item) => item.storeId)
				return hit?.storeId || ''
			},
			async loadDeliveryFee() {
				const storeId = this.resolveStoreId()
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
			async refreshCartProducts() {
				const items = getCartItems()
				if (!items.length) return
				const storeIds = [...new Set(items.map((item) => String(item.storeId || '')).filter(Boolean))]
				const remoteMap = {}
				try {
					const groups = storeIds.length ? storeIds : ['']
					for (const storeId of groups) {
						const data = await getProductListApi({
							...(storeId ? { storeId } : {}),
							pageNum: 1,
							pageSize: 999
						})
						const list = Array.isArray(data) ? data : (data?.list || [])
						list.forEach((row) => {
							remoteMap[String(row.productId || row.id)] = row
						})
					}
				} catch (error) {
					console.error('刷新购物车商品失败', error)
					return
				}

				const map = { ...getCartMap() }
				let changed = false
				items.forEach((item) => {
					const remote = remoteMap[String(item.productId || item.id)]
					const offShelf = !remote || Number(remote.productStatus) === 0
					const has = offShelf
						? 0
						: (remote.productNum == null ? 0 : Number(remote.productNum))
					const current = Number(map[item.id] || 0)
					const nextCount = offShelf ? current : Math.min(current, Math.max(0, has))
					if (nextCount !== current) {
						changed = true
						if (nextCount <= 0) {
							delete map[item.id]
						} else {
							map[item.id] = nextCount
						}
					}
					rememberCartProduct({
						...item,
						name: remote?.productName || item.name,
						price: remote ? Number(remote.price || 0) : item.price,
						icon: remote ? firstImage(remote.productImg) || item.icon : item.icon,
						has,
						offShelf,
						productId: remote?.productId || item.productId
					})
				})
				if (changed) {
					setCartMap(map)
				}
				this.reloadCart()
			},
			handlePlus(item) {
				if (item.offShelf) {
					uni.showToast({ title: '商品已下架', icon: 'none' })
					return
				}
				const stock = Number(item.has)
				const next = Number(item.count || 0) + 1
				if (Number.isFinite(stock) && stock >= 0 && next > stock) {
					uni.showToast({ title: '已达库存上限', icon: 'none' })
					return
				}
				this.cartMap = setCartItemCount(item.id, next)
			},
			handleMinus(item) {
				const next = Number(item.count || 0) - 1
				this.cartMap = setCartItemCount(item.id, next)
				if (next <= 0) {
					this.loadDeliveryFee()
				}
			},
			handleClear() {
				uni.showModal({
					title: '清空购物车',
					content: '确定清空购物车吗？',
					success: (res) => {
						if (!res.confirm) return
						clearCartMap()
						this.reloadCart()
						this.deliveryFee = 0
					}
				})
			},
			goMall() {
				uni.switchTab({
					url: '/pages/mall/index'
				})
			},
			goProductDetail(item) {
				if (!item) return
				const productId = encodeURIComponent(item.productId || item.id || '')
				const storeId = encodeURIComponent(item.storeId || '')
				uni.navigateTo({
					url: `/pages/mall/productDetail/index?productId=${productId}&storeId=${storeId}`
				})
			},
			async handleCheckout() {
				if (!this.cartCount) {
					uni.showToast({ title: '请先选择商品', icon: 'none' })
					return
				}
				if (this.cartItems.some((item) => item.offShelf)) {
					uni.showToast({ title: '请先移除已下架商品', icon: 'none' })
					return
				}
				if (!(await requireLogin({ force: true }))) return
				const phoneResult = await ensurePhoneBound({ required: true })
				if (!phoneResult.bound) {
					uni.showToast({ title: '请先授权手机号后再结算', icon: 'none' })
					return
				}
				const check = await assertStoreOpenForOrder(this.resolveStoreId())
				if (!check.ok) return
				uni.navigateTo({
					url: '/pages/mall/checkout/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.cart-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.empty-wrap {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.empty-btn {
		margin-top: 24rpx;
		height: 72rpx;
		padding: 0 48rpx;
		background-color: $primary;
		border-radius: 36rpx;
		color: #fff;
		font-size: 28rpx;
		font-weight: 600;
		line-height: 72rpx;
	}

	.cart-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 32rpx 8rpx;
	}

	.cart-count {
		font-size: 26rpx;
		color: #999;
	}

	.cart-clear {
		font-size: 26rpx;
		color: #999;
	}

	.cart-list {
		margin: 0 24rpx;
		padding: 8rpx 24rpx;
		background-color: #fff;
		border-radius: 16rpx;
	}

	.cart-item {
		display: flex;
		align-items: flex-start;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}
	}

	.cart-img {
		flex-shrink: 0;
		width: 140rpx;
		height: 140rpx;
		border-radius: 8rpx;
		background-color: #f8f8f8;
	}

	.cart-info {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		min-height: 140rpx;
	}

	.cart-name {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.cart-invalid {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #ff6034;
	}

	.cart-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: auto;
	}

	.cart-price {
		display: flex;
		align-items: baseline;
	}

	.price-symbol {
		font-size: 22rpx;
		color: #ff6034;
		font-weight: 600;
	}

	.price-value {
		font-size: 32rpx;
		color: #ff6034;
		font-weight: 700;
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.stepper-btn {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		border: 1rpx solid #ddd;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
	}

	.stepper-btn--plus {
		background-color: $primary;
		border-color: $primary;
	}

	.stepper-btn--plus.disabled {
		opacity: 0.45;
	}

	.stepper-count {
		min-width: 32rpx;
		text-align: center;
		font-size: 28rpx;
		color: #333;
	}

	.action-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.action-sum {
		display: flex;
		flex-direction: column;
	}

	.sum-row {
		display: flex;
		align-items: baseline;
		gap: 8rpx;
	}

	.sum-label {
		font-size: 26rpx;
		color: #666;
	}

	.sum-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #ff6034;
	}

	.sum-tip {
		margin-top: 4rpx;
		font-size: 22rpx;
		color: #999;
	}

	.action-btn {
		height: 72rpx;
		padding: 0 48rpx;
		background-color: $primary;
		border-radius: 36rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #fff;
		line-height: 72rpx;
		flex-shrink: 0;
	}
</style>
