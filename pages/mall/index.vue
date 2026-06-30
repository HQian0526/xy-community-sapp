<template>
	<view class="mall-page">
		<view class="search-wrap">
			<view class="search-bar" @click="handleSearch">
				<up-icon name="search" size="16" color="#999"></up-icon>
				<text class="search-placeholder">搜索商品</text>
			</view>
		</view>

		<view class="cate-tab-wrap">
			<up-cate-tab
				mode="tab"
				height="100%"
				:tabList="categoryList"
				v-model:current="currentCate"
			>
				<template #itemList="{ item }">
					<view class="cate-header">
						<text class="cate-name">{{ item.name }}</text>
						<text class="cate-count">共 {{ item.children.length }} 件商品</text>
					</view>
					<view class="product-list">
						<view
							v-for="product in item.children"
							:key="product.id"
							class="product-card"
							@click="goProductDetail(product)"
						>
							<image class="product-img" :src="product.icon || '/static/image-wrong.png'" mode="aspectFill" />
							<view class="product-info">
								<text class="product-name">{{ product.name }}</text>
								<text class="product-sales">库存 {{ product.has }}{{ product.unit }}</text>
								<view class="product-bottom">
									<view class="product-price">
										<text class="price-symbol">¥</text>
										<text class="price-value">{{ product.price }}</text>
										<text v-if="product.originalPrice > product.price" class="price-original">¥{{ product.originalPrice }}</text>
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

		<view v-if="cartCount > 0" class="cart-bar" @click="handleCart">
			<view class="cart-icon-wrap">
				<up-icon name="shopping-cart" size="22" color="#fff"></up-icon>
				<view class="cart-badge">{{ cartCount }}</view>
			</view>
			<view class="cart-info">
				<text class="cart-total">¥{{ cartTotal.toFixed(2) }}</text>
				<text class="cart-tip">另需配送费 ¥0</text>
			</view>
			<view class="cart-submit">去结算</view>
		</view>
	</view>
</template>

<script>
	import { categoryList } from './mock.js'

	export default {
		data() {
			return {
				categoryList,
				currentCate: 0,
				socialName: '上海-汤臣一品',
				cartMap: {}
			}
		},
		computed: {
			cartCount() {
				return Object.values(this.cartMap).reduce((sum, n) => sum + n, 0)
			},
			cartTotal() {
				let total = 0
				this.categoryList.forEach(cate => {
					cate.children.forEach(product => {
						const count = this.cartMap[product.id] || 0
						total += count * product.price
					})
				})
				return total
			}
		},
		methods: {
			handleSearch() {
				uni.showToast({ title: '搜索功能开发中', icon: 'none' })
			},
			goProductDetail(product) {
				uni.showToast({ title: product.name, icon: 'none' })
			},
			handleAddCart(product) {
				const count = this.cartMap[product.id] || 0
				this.cartMap = { ...this.cartMap, [product.id]: count + 1 }
				uni.showToast({ title: '已加入购物车', icon: 'none' })
			},
			handleCart() {
				uni.showToast({ title: `共 ${this.cartCount} 件商品`, icon: 'none' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.mall-page {
		height: 100vh;
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
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom);
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

	.product-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding-bottom: 120rpx;
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
		padding: 0 8rpx 0 24rpx;
		z-index: 100;
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
	}
</style>
