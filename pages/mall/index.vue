<template>
	<view class="mall-root">
		<view class="mall-page">
			<view class="search-wrap">
				<up-search
					v-model="searchKeyword"
					placeholder="搜索商品名称"
					shape="round"
					bgColor="#fff"
					:showAction="false"
					@clear="handleSearchClear"
				></up-search>
			</view>

			<view v-if="isSearching" class="search-result-wrap">
				<scroll-view scroll-y class="search-result-scroll" :style="{ height: contentHeight }">
					<view class="search-result-header">
						<text class="search-result-tip">找到 {{ searchResults.length }} 件相关商品</text>
					</view>
					<u-empty
						v-if="!searchResults.length"
						text="未找到相关商品"
						mode="search"
						marginTop="80"
					></u-empty>
					<view v-else class="product-list" :class="{ 'product-list--with-cart': cartCount > 0 }">
						<view
							v-for="product in searchResults"
							:key="product.id"
							class="product-card"
							@click="goProductDetail(product)"
						>
							<image
								class="product-img"
								:src="product.icon || '/static/image-wrong.png'"
								mode="aspectFill"
							/>
							<view class="product-info">
								<text class="product-name">{{ product.name }}</text>
								<text class="product-sales">{{ product.categoryName }} · 库存 {{ product.has }}{{ product.unit }}</text>
								<view class="product-bottom">
									<view class="product-price">
										<text class="price-symbol">¥</text>
										<text class="price-value">{{ product.price }}</text>
										<text v-if="product.originalPrice > product.price" class="price-original">
											¥{{ product.originalPrice }}
										</text>
									</view>
									<view class="add-btn" @click.stop="handleAddCart(product)">
										<up-icon name="plus" size="14" color="#fff"></up-icon>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>

			<view v-else class="cate-tab-wrap">
				<up-cate-tab mode="tab" :height="contentHeight" :tabList="categoryList" v-model:current="currentCate">
					<template #itemList="{ item }">
						<view class="cate-header">
							<text class="cate-name">{{ item.name }}</text>
							<text class="cate-count">共 {{ (item.children || []).length }} 件商品</text>
						</view>
						<view class="product-list" :class="{ 'product-list--with-cart': cartCount > 0 }">
							<u-empty
								v-if="!(item.children && item.children.length)"
								text="该分类暂无商品"
								mode="list"
								marginTop="60"
							></u-empty>
							<view v-for="product in (item.children || [])" :key="product.id" class="product-card"
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

			<view v-if="cartCount > 0" class="cart-bar" :style="{ bottom: cartBarBottom }">
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
		<bind-phone-popup ref="bindPhonePopup" />
	</view>
</template>

<script>
	import {
		searchProducts
	} from './search.js'
	import {
		getCartMap,
		setCartMap,
		clearCartMap,
		getCartItems,
		getCartCount,
		getCartTotal,
		rememberCartProduct
	} from './cart.js'
	import {
		requireLogin,
		waitBootstrapAuth,
		ensureUserInfo,
		ensurePhoneBound
	} from '@/common/auth.js'
	import {
		applyLaunchQuery,
		resolveViewStoreId
	} from '@/common/storeVisit.js'
	import {
		getCatagoryListApi
	} from '@/common/api/mall/catagory.js'
	import {
		getProductListApi
	} from '@/common/api/mall/product.js'
	import {
		assertStoreOpenForOrder
	} from '@/common/api/personalCenter/store.js'
	import {
		resolveFileUrl
	} from '@/common/api/config.js'
	import bindPhoneMixin from '@/common/mixin/bindPhoneMixin.js'
	import BindPhonePopup from '@/components/bind-phone-popup/bind-phone-popup.vue'

	/** 把接口商品字段转成列表展示结构 */
	function mapProductItem(item, categoryName = '', fallbackStoreId = '') {
		return {
			id: String(item.productId || item.id),
			productId: item.productId || item.id,
			catagoryId: item.catagoryId,
			storeId: item.storeId || fallbackStoreId || '',
			name: item.productName || '',
			icon: resolveFileUrl(item.productImg || ''),
			price: Number(item.price || 0),
			originalPrice: Number(item.price || 0),
			has: item.productNum == null ? 0 : Number(item.productNum),
			unit: '件',
			saleNum: item.saleNum == null ? 0 : Number(item.saleNum),
			categoryName: item.catagoryName || categoryName || '',
			remark: item.remark || ''
		}
	}

	export default {
		mixins: [bindPhoneMixin],
		components: {
			BindPhonePopup
		},
		data() {
			return {
				categoryList: [],
				categoryLoading: false,
				pageBootstrapping: false,
				currentCate: 0,
				searchKeyword: '',
				socialName: '上海-汤臣一品',
				cartMap: {},
				cartShow: false,
				contentHeight: '100%',
				cartBarBottom: '66px',
				queryStoreId: ''
			}
		},
		onLoad(options = {}) {
			const storeId = applyLaunchQuery(options)
			if (storeId) {
				this.syncCartWithStore(storeId)
			}
		},
		/** 进入页面：同步购物车后加载分类商品（游客可浏览，不弹登录/手机号） */
		async onShow() {
			this.cartMap = getCartMap()
			this.$nextTick(() => {
				this.updateCateTabHeight()
			})
			await new Promise((resolve) => this.$nextTick(resolve))
			if (this.pageBootstrapping) return
			this.pageBootstrapping = true
			try {
				await waitBootstrapAuth()
				await this.ensureMallStoreId()
				this.syncCartWithStore(this.queryStoreId)
				await this.loadCategoryList()
			} finally {
				this.pageBootstrapping = false
			}
		},
		/** 页面初次渲染完成，计算分类区高度 */
		onReady() {
			this.updateCateTabHeight()
		},
		watch: {
			/** 切换左侧分类时按需加载该分类商品 */
			currentCate(index) {
				this.loadCategoryProducts(index)
			}
		},
		computed: {
			/** 是否处于搜索态（有搜索关键词） */
			isSearching() {
				return !!String(this.searchKeyword || '').trim()
			},
			/** 按关键词从已加载分类中筛出的商品 */
			searchResults() {
				return searchProducts(this.categoryList, this.searchKeyword)
			},
			/** 购物车商品总件数 */
			cartCount() {
				return getCartCount(this.cartMap)
			},
			/** 购物车明细列表（含数量、价格、图片） */
			cartItems() {
				return getCartItems(this.cartMap)
			},
			/** 购物车合计金额 */
			cartTotal() {
				return getCartTotal(this.cartMap)
			}
		},
		methods: {
			/** 扫码进店优先，其次用户绑定店铺，最后项目默认店铺 */
			async ensureMallStoreId() {
				try {
					const user = await ensureUserInfo()
					this.queryStoreId = resolveViewStoreId(user)
				} catch (error) {
					console.error('获取用户绑定店铺失败', error)
					this.queryStoreId = resolveViewStoreId(null)
				}
			},
			/** 购物车里已有其他店商品时清空，避免串店 */
			syncCartWithStore(storeId) {
				if (!storeId) return
				const items = getCartItems()
				const hasForeign = items.some((item) => item.storeId && String(item.storeId) !== String(storeId))
				if (hasForeign) {
					clearCartMap()
					this.cartMap = {}
				}
			},
			/** 拉取店铺商品分类，并加载当前选中分类下的商品 */
			async loadCategoryList() {
				if (this.categoryLoading) return
				this.categoryLoading = true
				try {
					const params = {}
					if (this.queryStoreId) {
						params.storeId = this.queryStoreId
					}
					const data = await getCatagoryListApi(params)
					const list = Array.isArray(data) ? data : (data?.list || [])
					this.categoryList = list
						.slice()
						.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0))
						.map((item) => ({
							id: item.catagoryId || item.id,
							catagoryId: item.catagoryId || item.id,
							storeId: item.storeId || this.queryStoreId || '',
							name: item.catagoryName || '',
							children: [],
							productsLoaded: false,
							productsLoading: false
						}))
					if (this.currentCate >= this.categoryList.length) {
						this.currentCate = 0
					}
					await this.loadCategoryProducts(this.currentCate)
				} catch (error) {
					console.error('获取商品分类失败', error)
					this.categoryList = []
				} finally {
					this.categoryLoading = false
				}
			},
			/** 按分类懒加载上架商品，已加载过则跳过 */
			async loadCategoryProducts(index) {
				const cate = this.categoryList[index]
				if (!cate || !cate.catagoryId) return
				if (cate.productsLoaded || cate.productsLoading) return

				this.categoryList = this.categoryList.map((item, i) => {
					if (i !== index) return item
					return {
						...item,
						productsLoading: true
					}
				})

				try {
					const data = await getProductListApi({
						catagoryId: cate.catagoryId,
						productStatus: 1,
						...(this.queryStoreId ? {
							storeId: this.queryStoreId
						} : {})
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const children = list
						.filter((item) => item.productStatus !== 0)
						.map((item) => mapProductItem(item, cate.name, cate.storeId))

					this.categoryList = this.categoryList.map((item, i) => {
						if (i !== index) return item
						return {
							...item,
							children,
							productsLoaded: true,
							productsLoading: false
						}
					})
				} catch (error) {
					console.error('获取分类商品失败', error)
					this.categoryList = this.categoryList.map((item, i) => {
						if (i !== index) return item
						return {
							...item,
							children: [],
							productsLoaded: false,
							productsLoading: false
						}
					})
				}
			},
			/** 把当前购物车数量写入本地缓存 */
			saveCartMap() {
				setCartMap(this.cartMap)
			},
			/** 按窗口和搜索栏高度计算分类列表高度、购物车栏位置 */
			updateCateTabHeight() {
				const sys = uni.getSystemInfoSync()
				// windowHeight：已扣除导航栏和原生 tabBar 后的可用高度，不要再减 tabBar/safeBottom
				const windowHeight = sys.windowHeight || sys.screenHeight || 0
				// windowBottom：窗口底到屏幕底距离（有 tabBar 时约等于 tabBar 高度，含安全区）
				const windowBottom = typeof sys.windowBottom === 'number' ? sys.windowBottom : 50
				const gap = uni.upx2px(16)
				this.cartBarBottom = `${windowBottom + gap}px`

				this.$nextTick(() => {
					uni.createSelectorQuery()
						.in(this)
						.select('.search-wrap')
						.boundingClientRect((rect) => {
							const searchHeight = rect && rect.height ? rect.height : uni.upx2px(96)
							const height = windowHeight - searchHeight
							this.contentHeight = `${Math.max(height, 200)}px`
						})
						.exec()
				})
			},
			/** 清空搜索关键词，回到分类浏览 */
			handleSearchClear() {
				this.searchKeyword = ''
			},
			/** 点击商品卡片（暂用 toast 展示名称） */
			goProductDetail(product) {
				uni.showToast({
					title: product.name,
					icon: 'none'
				})
			},
			/** 商品加购一件并记住商品信息 */
			handleAddCart(product) {
				rememberCartProduct(product)
				const count = this.cartMap[product.id] || 0
				this.cartMap = {
					...this.cartMap,
					[product.id]: count + 1
				}
				this.saveCartMap()
			},
			/** 购物车减一件，减到 0 时移除该商品 */
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
			/** 打开底部购物车弹层 */
			openCartPopup() {
				this.cartShow = true
			},
			/** 关闭底部购物车弹层 */
			closeCartPopup() {
				this.cartShow = false
			},
			/** 清空购物车并关闭弹层 */
			clearCart() {
				this.cartMap = {}
				clearCartMap()
				this.cartShow = false
			},
			/** 结算前解析店铺 id：优先购物车商品，其次分类，再次当前查询店铺 */
			resolveCheckoutStoreId() {
				const cartItem = this.cartItems.find((item) => item.storeId)
				if (cartItem?.storeId) return cartItem.storeId
				const cate = this.categoryList.find((item) => item.storeId)
				return cate?.storeId || this.queryStoreId || ''
			},
			/** 去结算：先登录，未授权手机号必须授权后才进入确认页 */
			async handleCheckout() {
				if (!this.cartCount) {
					uni.showToast({
						title: '请先选择商品',
						icon: 'none'
					})
					return
				}
				if (!(await requireLogin({
						force: true
					}))) return
				const phoneResult = await ensurePhoneBound({
					required: true
				})
				if (!phoneResult.bound) {
					uni.showToast({
						title: '请先授权手机号后再结算',
						icon: 'none'
					})
					return
				}
				// 点结算时实时查 /store/findStore，覆盖「选购中商家突然打烊」
				const check = await assertStoreOpenForOrder(this.resolveCheckoutStoreId())
				if (!check.ok) return
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
		height: 100%;
		min-height: 100%;
		overflow: hidden;
	}

	.mall-page {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
		overflow: hidden;
		box-sizing: border-box;
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

	.search-result-wrap {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.search-result-header {
		padding: 0 0 16rpx;
	}

	.search-result-tip {
		font-size: 24rpx;
		color: #999;
	}

	.search-result-scroll {
		flex: 1;
		min-height: 0;
		padding: 0 24rpx;
		box-sizing: border-box;
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
		/* bottom 由 JS 按 windowBottom 动态设置，贴齐原生 tabBar 上方 */
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

<style lang="scss">
	/* 页面高度撑满可用区域（已不含原生 tabBar），供子元素 height:100% 生效 */
	page {
		height: 100%;
		background-color: #f5f5f5;
	}
</style>