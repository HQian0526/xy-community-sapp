<template>
	<view class="detail-page">
		<view v-if="loading" class="empty-wrap">
			<u-loading-icon mode="circle" size="36"></u-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>

		<view v-else-if="!product" class="empty-wrap">
			<u-empty text="商品不存在或已下架" mode="data"></u-empty>
		</view>

		<template v-else>
			<swiper
				class="gallery"
				:indicator-dots="images.length > 1"
				indicator-color="rgba(255,255,255,0.45)"
				indicator-active-color="#00a896"
				:circular="images.length > 1"
			>
				<swiper-item v-for="(img, index) in images" :key="index" @click="previewImage(index)">
					<image class="gallery-img" :src="img" mode="aspectFill" />
				</swiper-item>
			</swiper>

			<view class="info-card">
				<view v-if="miniappUi.enablePay" class="price-row">
					<text v-if="product.hasMemberPrice" class="price-label">会员价：</text>
					<text class="price-symbol" :class="{ 'price-symbol--member': product.hasMemberPrice }">¥</text>
					<text class="price-value" :class="{ 'price-value--member': product.hasMemberPrice }">{{ formatMoney(product.price) }}</text>
					<text v-if="product.hasMemberPrice" class="price-original">¥{{ formatMoney(product.originalPrice) }}</text>
				</view>
				<text class="product-name">{{ product.name }}</text>
				<view v-if="miniappUi.showSaleNum || miniappUi.showStock" class="meta-row">
					<text v-if="miniappUi.showSaleNum">销量 {{ product.saleNum }}{{ product.unit }}</text>
					<text v-if="miniappUi.showStock">库存 {{ product.has }}{{ product.unit }}</text>
				</view>
			</view>

			<view v-if="miniappUi.showQuantity" class="info-card">
				<view class="qty-row">
					<text class="qty-label">购买数量</text>
					<view class="stepper">
						<view class="stepper-btn" :class="{ disabled: quantity <= 1 }" @click="changeQty(-1)">
							<up-icon name="minus" size="12" :color="quantity <= 1 ? '#ccc' : '#333'"></up-icon>
						</view>
						<text class="stepper-count">{{ quantity }}</text>
						<view
							class="stepper-btn stepper-btn--plus"
							:class="{ disabled: !canIncrease }"
							@click="changeQty(1)"
						>
							<up-icon name="plus" size="12" color="#fff"></up-icon>
						</view>
					</view>
				</view>
			</view>

			<view class="info-card desc-card">
				<text class="desc-title">商品描述</text>
				<text class="desc-text">{{ product.remark || '暂无描述' }}</text>
			</view>

			<view class="bottom-placeholder"></view>
			<view class="action-bar">
				<view
					v-if="miniappUi.showCart"
					class="action-btn action-btn--cart"
					:class="{ disabled: soldOut }"
					@click="handleAddCart"
				>
					加入购物车
				</view>
				<view class="action-btn action-btn--buy" :class="{ disabled: soldOut }" @click="handleBuyNow">
					{{ miniappUi.orderBtnText }}
				</view>
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
	import { assertStoreOpenForOrder } from '@/common/api/personalCenter/store.js'
	import { resolveFileUrl } from '@/common/api/config.js'
	import { addCartQuantity } from '../cart.js'
	import { formatMoney } from '../checkout/mock.js'
	import { pickDisplayPrice } from '@/common/api/mall/member.js'
	import { getStoreListApi } from '@/common/api/personalCenter/store.js'
	import {
		applyStoreMiniappUi,
		getMiniappUi,
		isMiniappUiReady,
		mallMiniappUi
	} from '@/common/miniappUi.js'
	import { buildProductShareConfig } from '@/common/share/config.js'

	function splitImages(raw) {
		return String(raw || '')
			.split(',')
			.map((item) => resolveFileUrl(String(item).trim()))
			.filter(Boolean)
	}

	function mapProduct(item, fallbackStoreId = '') {
		if (!item) return null
		const images = splitImages(item.productImg || item.icon)
		const priced = pickDisplayPrice(item)
		return {
			id: String(item.productId || item.id),
			productId: item.productId || item.id,
			catagoryId: item.catagoryId,
			storeId: item.storeId || fallbackStoreId || '',
			name: item.productName || item.name || '',
			icon: images[0] || resolveFileUrl(item.icon || ''),
			images: images.length ? images : ['/static/image-wrong.png'],
			price: priced.price,
			originalPrice: priced.originalPrice,
			memberPrice: priced.memberPrice,
			hasMemberPrice: priced.hasMemberPrice,
			has: item.productNum == null
				? (item.has == null ? 0 : Number(item.has))
				: Number(item.productNum),
			unit: item.unit || '件',
			saleNum: item.saleNum == null ? 0 : Number(item.saleNum),
			remark: item.remark || '',
			productStatus: item.productStatus
		}
	}

	export default {
		mixins: [bindPhoneMixin],
		components: {
			BindPhonePopup
		},
		data() {
			return {
				loading: true,
				productLoaded: false,
				uiLoaded: false,
				productId: '',
				storeId: '',
				product: null,
				quantity: 1,
				miniappUi: mallMiniappUi()
			}
		},
		computed: {
			images() {
				return this.product?.images || ['/static/image-wrong.png']
			},
			soldOut() {
				if (!this.product) return true
				if (Number(this.product.productStatus) === 0) return true
				if (!this.miniappUi.showStock) return false
				return Number(this.product.has) <= 0
			},
			canIncrease() {
				if (this.soldOut) return false
				if (!this.miniappUi.showStock) return true
				return this.quantity < Number(this.product.has || 0)
			}
		},
		onLoad(options = {}) {
			this.productId = decodeURIComponent(options.productId || options.id || '').trim()
			this.storeId = decodeURIComponent(options.storeId || '').trim()
			try {
				const channel = this.getOpenerEventChannel && this.getOpenerEventChannel()
				if (channel && typeof channel.on === 'function') {
					channel.on('product', (item) => {
						if (this.product) return
						this.applyProduct(mapProduct(item, this.storeId))
					})
				}
			} catch (e) {
				console.log(e)
			}
			this.loadProduct()
			this.loadMiniappUi()
		},
		methods: {
			formatMoney,
			/** 分享配置：有商品时分享当前商品，商品未加载完成则分享本店首页 */
			buildShareConfig() {
				return buildProductShareConfig(this.product, this.storeId)
			},
			finishLoading() {
				if (this.productLoaded && this.uiLoaded) {
					this.loading = false
				}
			},
			async loadMiniappUi() {
				try {
					const readyUi = isMiniappUiReady() ? getMiniappUi() : null
					if (readyUi && (!this.storeId || String(readyUi.storeId || '') === String(this.storeId))) {
						this.miniappUi = readyUi
					} else if (this.storeId) {
						const data = await getStoreListApi({
							storeId: this.storeId,
							pageNum: 1,
							pageSize: 1
						})
						const list = Array.isArray(data) ? data : (data?.list || [])
						this.miniappUi = applyStoreMiniappUi(list[0])
					} else {
						this.miniappUi = applyStoreMiniappUi(null)
					}
					this.syncQuantityByUi()
				} catch (error) {
					console.error('获取小程序权限失败', error)
					this.miniappUi = applyStoreMiniappUi(null)
				} finally {
					this.uiLoaded = true
					this.finishLoading()
				}
			},
			syncQuantityByUi() {
				if (!this.miniappUi.showQuantity) {
					this.quantity = 1
				}
			},
			applyProduct(mapped) {
				if (!mapped) return
				this.product = mapped
				this.storeId = mapped.storeId || this.storeId
				this.quantity = this.soldOut ? 1 : Math.min(this.quantity || 1, Math.max(1, Number(mapped.has) || 1))
				this.syncQuantityByUi()
				this.productLoaded = true
				this.finishLoading()
			},
			async loadProduct() {
				if (!this.productId) {
					this.productLoaded = true
					this.finishLoading()
					return
				}
				try {
					const data = await getProductListApi({
						productId: this.productId,
						...(this.storeId ? { storeId: this.storeId } : {})
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const hit = list.find(
						(item) => String(item.productId || item.id) === String(this.productId)
					) || list[0]
					if (hit) {
						this.applyProduct(mapProduct(hit, this.storeId))
					} else if (!this.product) {
						this.productLoaded = true
						this.finishLoading()
					}
				} catch (error) {
					console.error('加载商品详情失败', error)
					if (!this.product) {
						this.productLoaded = true
						this.finishLoading()
					}
				}
			},
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.images
				})
			},
			changeQty(step) {
				if (!this.product || this.soldOut) return
				const next = this.quantity + step
				if (next < 1) return
				if (this.miniappUi.showStock && next > Number(this.product.has || 0)) {
					uni.showToast({ title: '已达库存上限', icon: 'none' })
					return
				}
				this.quantity = next
			},
			ensureCanBuy() {
				if (!this.product) return false
				if (this.soldOut) {
					uni.showToast({ title: '商品已售罄', icon: 'none' })
					return false
				}
				return true
			},
			addCurrentQty() {
				const result = addCartQuantity(this.product, this.quantity)
				if (result.ok) return true
				if (result.reason === 'otherStore') {
					uni.showToast({ title: '购物车中有其他店铺商品，请先结算', icon: 'none' })
				} else if (result.reason === 'stock') {
					uni.showToast({ title: '库存不足', icon: 'none' })
				} else {
					uni.showToast({ title: '加入购物车失败', icon: 'none' })
				}
				return false
			},
			handleAddCart() {
				if (!this.miniappUi.showCart) return
				if (!this.ensureCanBuy()) return
				if (!this.addCurrentQty()) return
				uni.showToast({ title: '已加入购物车', icon: 'success' })
			},
			async handleBuyNow() {
				if (!this.ensureCanBuy()) return
				if (!(await requireLogin({ force: true }))) return
				const phoneResult = await ensurePhoneBound({ required: true })
				if (!phoneResult.bound) {
					uni.showToast({ title: '请先授权手机号后再购买', icon: 'none' })
					return
				}
				const check = await assertStoreOpenForOrder(this.product.storeId || this.storeId)
				if (!check.ok) return
				if (!this.addCurrentQty()) return
				uni.navigateTo({
					url: '/pages/mall/checkout/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #00a896;

	.detail-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.empty-wrap {
		padding-top: 240rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.loading-text {
		font-size: 26rpx;
		color: #999;
	}

	.gallery {
		width: 100%;
		height: 750rpx;
		background-color: #fff;
	}

	.gallery-img {
		width: 100%;
		height: 750rpx;
		background-color: #f8f8f8;
	}

	.info-card {
		margin: 20rpx 24rpx 0;
		padding: 28rpx 24rpx;
		background-color: #fff;
		border-radius: 16rpx;
	}

	.price-row {
		display: flex;
		align-items: baseline;
	}

	.price-label {
		font-size: 26rpx;
		color: #00a896;
		font-weight: 600;
		margin-right: 6rpx;
	}

	.price-symbol {
		font-size: 28rpx;
		font-weight: 600;
		color: #ff6034;
	}

	.price-value {
		font-size: 48rpx;
		font-weight: 700;
		color: #ff6034;
		line-height: 1.1;
	}

	.price-symbol--member,
	.price-value--member {
		color: #00a896;
	}

	.price-original {
		margin-left: 12rpx;
		font-size: 26rpx;
		color: #bbb;
		text-decoration: line-through;
	}

	.product-name {
		display: block;
		margin-top: 16rpx;
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
		line-height: 1.45;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
	}

	.qty-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.qty-label {
		font-size: 28rpx;
		color: #333;
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.stepper-btn {
		width: 48rpx;
		height: 48rpx;
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

	.stepper-btn.disabled {
		opacity: 0.45;
	}

	.stepper-count {
		min-width: 40rpx;
		text-align: center;
		font-size: 30rpx;
		color: #333;
	}

	.desc-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 16rpx;
	}

	.desc-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.7;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.action-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 20;
		display: flex;
		gap: 16rpx;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.action-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 600;
	}

	.action-btn--cart {
		color: $primary;
		background-color: #e8f8f5;
	}

	.action-btn--buy {
		color: #fff;
		background-color: $primary;
	}

	.action-btn.disabled {
		opacity: 0.45;
	}
</style>
