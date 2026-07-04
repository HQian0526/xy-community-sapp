<template>
	<view class="mall-root">
		<view class="mall-page">
			<view class="search-wrap">
				<view class="search-bar" @click="handleSearch">
					<up-icon name="search" size="16" color="#999"></up-icon>
					<text class="search-placeholder">搜索商品</text>
				</view>
			</view>

			<view class="cate-tab-wrap">
				<up-cate-tab mode="tab" :height="cateTabHeight" :tabList="categoryList" v-model:current="currentCate">
					<template #itemList="{ item }">
						<view class="cate-header">
							<text class="cate-name">{{ item.name }}</text>
							<text class="cate-count">共 {{ item.children.length }} 件商品</text>
						</view>
						<view class="product-list" :class="{ 'product-list--with-cart': cartCount > 0 }">
							<view v-for="product in item.children" :key="product.id" class="product-card"
								@click="goProductDetail(product)">
								<image class="product-img" :src="product.icon || '/static/image-wrong.png'"
									mode="aspectFill" />
								<view class="product-info">
									<text class="product-name">{{ product.name }}</text>
									<text class="product-sales">库存 {{ product.has }}{{ product.unit }}</text>
									<view class="product-bottom">
										<view class="product-price">
											<text class="price-symbol">¥</text>
											<text class="price-value">{{ product.price }}</text>
											<text v-if="product.originalPrice > product.price"
												class="price-original">¥{{ product.originalPrice }}</text>
										</view>
										<view class="add-btn" @click.stop="handleAddCart(product)">
											<up-icon name="plus" size="14" color="#fff"></up-icon>
										</view>
									</view>
								</view>
							</view>
						</view>
					</template>
				</up-cate-tab>
			</view>

			<view v-if="cartCount > 0" class="cart-bar">
				<view class="cart-left" @click="openCartPopup">
					<view class="cart-icon-wrap">
						<up-icon name="shopping-cart" size="22" color="#fff"></up-icon>
						<view class="cart-badge">{{ cartCount }}</view>
					</view>
					<view class="cart-info">
						<text class="cart-total">¥{{ cartTotal.toFixed(2) }}</text>
						<text class="cart-tip">另需配送费 ¥0</text>
					</view>
				</view>
				<view class="cart-submit" @click.stop="handleCheckout">去结算</view>
			</view>
		</view>

		<view class="cart-popup-host">
			<u-popup :show="cartShow" mode="bottom" round="16" closeOnClickOverlay @close="closeCartPopup">
				<view class="cart-popup">
					<view class="cart-popup-header">
						<text class="cart-popup-title">购物车</text>
						<text class="cart-popup-count">共 {{ cartCount }} 件</text>
						<text v-if="cartCount > 0" class="cart-popup-clear" @click="clearCart">清空</text>
					</view>

					<scroll-view scroll-y class="cart-popup-list">
						<view v-for="item in cartItems" :key="item.id" class="cart-item">
							<image class="cart-item-img" :src="item.icon || '/static/image-wrong.png'"
								mode="aspectFill" />
							<view class="cart-item-info">
								<text class="cart-item-name">{{ item.name }}</text>
								<view class="cart-item-bottom">
									<view class="cart-item-price">
										<text class="price-symbol">¥</text>
										<text class="price-value">{{ item.price }}</text>
									</view>
									<view class="cart-item-stepper">
										<view class="stepper-btn" @click="handleMinusCart(item)">
											<up-icon name="minus" size="12" color="#666"></up-icon>
										</view>
										<text class="stepper-count">{{ item.count }}</text>
										<view class="stepper-btn stepper-btn--plus" @click="handleAddCart(item)">
											<up-icon name="plus" size="12" color="#fff"></up-icon>
										</view>
									</view>
								</view>
							</view>
						</view>
					</scroll-view>

					<view class="cart-popup-footer">
						<view class="cart-popup-total">
							<text class="total-label">合计</text>
							<text class="total-value">¥{{ cartTotal.toFixed(2) }}</text>
						</view>
						<view class="cart-popup-submit" @click="handleCheckout">去结算</view>
					</view>
				</view>
			</u-popup>
		</view>
	</view>
</template>

<script>
	import {
		categoryList
	} from './mock.js'
	import {
		getCartMap,
		setCartMap,
		clearCartMap,
		getCartItems,
		getCartCount,
		getCartTotal
	} from './cart.js'

	export default {
		data() {
			return {
				categoryList,
				currentCate: 0,
				socialName: '上海-汤臣一品',
				cartMap: {},
				cartShow: false,
				cateTabHeight: '100%'
			}
		},
		onShow() {
			this.cartMap = getCartMap()
		},
		onReady() {
			this.updateCateTabHeight()
		},
		computed: {
			cartCount() {
				return getCartCount(this.cartMap)
			},
			cartItems() {
				return getCartItems(this.cartMap)
			},
			cartTotal() {
				return getCartTotal(this.cartMap)
			}
		},
		methods: {
			saveCartMap() {
				setCartMap(this.cartMap)
			},
			updateCateTabHeight() {
				const {
					windowHeight,
					safeAreaInsets
				} = uni.getSystemInfoSync()
				const searchHeight = uni.upx2px(80)
				const tabBarHeight = uni.upx2px(100)
				const safeBottom = safeAreaInsets?.bottom || 0
				const height = windowHeight - searchHeight - tabBarHeight - safeBottom
				this.cateTabHeight = `${Math.max(height, 200)}px`
			},
			handleSearch() {
				uni.showToast({
					title: '搜索功能开发中',
					icon: 'none'
				})
			},
			goProductDetail(product) {
				uni.showToast({
					title: product.name,
					icon: 'none'
				})
			},
			handleAddCart(product) {
				const count = this.cartMap[product.id] || 0
				this.cartMap = {
					...this.cartMap,
					[product.id]: count + 1
				}
				this.saveCartMap()
			},
			handleMinusCart(product) {
				const count = this.cartMap[product.id] || 0
				if (count <= 1) {
					const next = {
						...this.cartMap
					}
					delete next[product.id]
					this.cartMap = next
					this.saveCartMap()
					if (this.cartCount === 0) {
						this.cartShow = false
					}
					return
				}
				this.cartMap = {
					...this.cartMap,
					[product.id]: count - 1
				}
				this.saveCartMap()
			},
			openCartPopup() {
				this.cartShow = true
			},
			closeCartPopup() {
				this.cartShow = false
			},
			clearCart() {
				this.cartMap = {}
				clearCartMap()
				this.cartShow = false
			},
			handleCheckout() {
				if (!this.cartCount) {
					uni.showToast({
						title: '请先选择商品',
						icon: 'none'
					})
					return
				}
				this.saveCartMap()
				this.closeCartPopup()
				uni.navigateTo({
					url: '/pages/mall/checkout/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.mall-root {
		height: 100vh;
		overflow: hidden;
	}

	.mall-page {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
		overflow: hidden;
	}

	.custom-title {
		flex-shrink: 0;
		padding: 12rpx 24rpx;
		color: #333333;
	}

	.search-wrap {
		flex-shrink: 0;
		padding: 0 24rpx 16rpx;
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 12rpx;
		height: 64rpx;
		padding: 0 24rpx;
		background-color: #fff;
		border-radius: 32rpx;
	}

	.search-placeholder {
		font-size: 26rpx;
		color: #999;
	}

	.cate-tab-wrap {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.product-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding-bottom: 24rpx;
	}

	.product-list--with-cart {
		padding-bottom: 140rpx;
	}

	.cate-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.cate-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.cate-count {
		font-size: 22rpx;
		color: #999;
	}

	.cart-popup-host {
		position: fixed;
		left: 0;
		top: 0;
		width: 0;
		height: 0;
		overflow: visible;
		z-index: 1000;
	}

	.product-card {
		display: flex;
		align-items: flex-start;
		padding: 16rpx;
		background-color: #fff;
		border-radius: 12rpx;
	}

	.product-img {
		flex-shrink: 0;
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		background-color: #f8f8f8;
	}

	.product-info {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 160rpx;
	}

	.product-name {
		font-size: 28rpx;
		font-weight: 500;
		color: #333;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.product-sales {
		font-size: 22rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.product-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: auto;
	}

	.product-price {
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

	.price-original {
		font-size: 22rpx;
		color: #bbb;
		text-decoration: line-through;
		margin-left: 8rpx;
	}

	.add-btn {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background-color: #00a896;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cart-bar {
		position: fixed;
		left: 24rpx;
		right: 24rpx;
		bottom: calc(100rpx + env(safe-area-inset-bottom));
		height: 96rpx;
		background-color: #2b2b2b;
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		padding: 0 8rpx 0 0;
		z-index: 100;
	}

	.cart-left {
		flex: 1;
		display: flex;
		align-items: center;
		padding-left: 24rpx;
		min-width: 0;
	}

	.cart-icon-wrap {
		position: relative;
		width: 80rpx;
		height: 80rpx;
		background-color: #00a896;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: -20rpx;
	}

	.cart-badge {
		position: absolute;
		top: -4rpx;
		right: -4rpx;
		min-width: 32rpx;
		height: 32rpx;
		padding: 0 8rpx;
		background-color: #ff6034;
		border-radius: 16rpx;
		font-size: 20rpx;
		color: #fff;
		text-align: center;
		line-height: 32rpx;
	}

	.cart-info {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.cart-total {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
	}

	.cart-tip {
		font-size: 20rpx;
		color: #999;
	}

	.cart-submit {
		height: 72rpx;
		padding: 0 40rpx;
		background-color: #00a896;
		border-radius: 36rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #fff;
		line-height: 72rpx;
		flex-shrink: 0;
	}

	.cart-popup {
		background-color: #fff;
		border-radius: 16rpx 16rpx 0 0;
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.cart-popup-header {
		display: flex;
		align-items: center;
		padding: 28rpx 32rpx 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.cart-popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.cart-popup-count {
		margin-left: 12rpx;
		font-size: 24rpx;
		color: #999;
	}

	.cart-popup-clear {
		margin-left: auto;
		font-size: 26rpx;
		color: #999;
	}

	.cart-popup-list {
		max-height: 50vh;
		padding: 8rpx 32rpx;
		box-sizing: border-box;
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

	.cart-item-img {
		flex-shrink: 0;
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		background-color: #f8f8f8;
	}

	.cart-item-info {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 120rpx;
	}

	.cart-item-name {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.cart-item-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 16rpx;
	}

	.cart-item-price {
		display: flex;
		align-items: baseline;
	}

	.cart-item-stepper {
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
		background-color: #00a896;
		border-color: #00a896;
	}

	.stepper-count {
		min-width: 32rpx;
		text-align: center;
		font-size: 28rpx;
		color: #333;
	}

	.cart-popup-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 32rpx 24rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.cart-popup-total {
		display: flex;
		align-items: baseline;
		gap: 8rpx;
	}

	.total-label {
		font-size: 26rpx;
		color: #666;
	}

	.total-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #ff6034;
	}

	.cart-popup-submit {
		height: 72rpx;
		padding: 0 48rpx;
		background-color: #00a896;
		border-radius: 36rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #fff;
		line-height: 72rpx;
	}
</style>