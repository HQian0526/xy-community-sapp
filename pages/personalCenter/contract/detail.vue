<template>
	<view class="detail-page">
		<view v-if="loading" class="empty-wrap">
			<up-loading-icon color="#00a896"></up-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>
		<template v-else-if="detail">
			<view class="info-card">
				<text class="name">{{ detail.contractName }}</text>
				<view class="row">
					<text class="label">合同编号</text>
					<text class="value">{{ detail.contractNo }}</text>
				</view>
				<view class="row">
					<text class="label">店铺</text>
					<text class="value">{{ detail.storeName }}</text>
				</view>
				<view class="row">
					<text class="label">状态</text>
					<text class="value accent">{{ detail.statusLabel }}</text>
				</view>
				<view class="row">
					<text class="label">金额</text>
					<text class="value">{{ detail.totalAmount == null ? '-' : ('¥' + detail.totalAmount) }}</text>
				</view>
			</view>

			<view class="info-card">
				<text class="card-title">签署方</text>
				<view v-for="item in detail.signers || []" :key="item.id" class="signer-row">
					<view class="signer-main">
						<text class="signer-role">{{ item.partyRoleLabel }}</text>
						<text class="signer-name">{{ item.signerName }}</text>
					</view>
					<text class="signer-status">{{ item.signStatusLabel }}</text>
				</view>
			</view>

			<view class="info-card">
				<text class="card-title">合同内容</text>
				<text class="content">{{ detail.contentSnapshot || '暂无正文' }}</text>
				<view class="sign-off">
					<text class="sign-off-label">乙方签字</text>
					<image
						v-if="merchantSignImage"
						class="sign-off-img"
						:src="merchantSignImage"
						mode="aspectFit"
					/>
					<text v-else class="sign-off-empty">{{ canSign ? '待手写签署' : '暂无签名' }}</text>
				</view>
			</view>

			<view v-if="canSign" class="submit-wrap">
				<view class="btn-success submit-btn" @click="openSignPad">立即签署</view>
			</view>
		</template>
		<view v-else class="empty-wrap">
			<u-empty text="合同不存在" mode="list"></u-empty>
		</view>

		<view v-if="signPadVisible" class="pad-mask" @touchmove.stop.prevent>
			<view class="pad-sheet">
				<text class="pad-title">手写签名</text>
				<text class="pad-tip">请在下方区域签上姓名。确定即表示已阅读并同意合同内容。</text>
				<canvas
					canvas-id="merchantSignPad"
					class="sign-canvas"
					disable-scroll
					@touchstart="onSignStart"
					@touchmove.stop.prevent="onSignMove"
					@touchend="onSignEnd"
				></canvas>
				<view class="pad-actions">
					<view class="pad-btn pad-btn-plain" @click="clearPad">清除</view>
					<view class="pad-btn pad-btn-plain" @click="closeSignPad">取消</view>
					<view class="pad-btn pad-btn-ok" @click="confirmSign">确定签署</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { requireLogin } from '@/common/auth.js'
	import { resolveFileUrl } from '@/common/api/config.js'
	import { uploadFile } from '@/common/api/request.js'
	import {
		completeMySignApi,
		getMyContractDetailApi
	} from '@/common/api/personalCenter/contract.js'

	export default {
		data() {
			return {
				loading: false,
				signing: false,
				contractNo: '',
				detail: null,
				signPadVisible: false,
				hasStroke: false,
				drawing: false
			}
		},
		computed: {
			canSign() {
				if (!this.detail) return false
				if (Number(this.detail.contractStatus) !== 1) return false
				return Number(this.detail.merchantSignStatus) === 0
			},
			merchantSignImage() {
				const signer = (this.detail && this.detail.signers || []).find((item) => Number(item.partyRole) === 2)
				return resolveFileUrl(signer && signer.signImageUrl)
			}
		},
		onLoad(query) {
			this.contractNo = decodeURIComponent((query && query.no) || '')
		},
		async onShow() {
			if (!(await requireLogin({ force: true }))) return
			this.loadDetail()
		},
		methods: {
			async loadDetail() {
				if (!this.contractNo) return
				this.loading = true
				try {
					this.detail = await getMyContractDetailApi(this.contractNo)
				} catch (error) {
					console.error('加载合同详情失败', error)
					this.detail = null
				} finally {
					this.loading = false
				}
			},
			openSignPad() {
				if (this.signing) return
				this.signPadVisible = true
				this.hasStroke = false
				this.drawing = false
				this.$nextTick(() => {
					setTimeout(() => {
						this.signCtx = uni.createCanvasContext('merchantSignPad', this)
						this.signCtx.setStrokeStyle('#222222')
						this.signCtx.setLineWidth(4)
						this.signCtx.setLineCap('round')
						this.signCtx.setLineJoin('round')
						this.clearPad()
					}, 50)
				})
			},
			closeSignPad() {
				if (this.signing) return
				this.signPadVisible = false
				this.hasStroke = false
				this.drawing = false
			},
			touchPoint(e) {
				const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || {}
				return {
					x: t.x,
					y: t.y
				}
			},
			onSignStart(e) {
				if (!this.signCtx) return
				const p = this.touchPoint(e)
				this.drawing = true
				this.hasStroke = true
				this.signCtx.beginPath()
				this.signCtx.moveTo(p.x, p.y)
			},
			onSignMove(e) {
				if (!this.signCtx || !this.drawing) return
				const p = this.touchPoint(e)
				this.signCtx.lineTo(p.x, p.y)
				this.signCtx.stroke()
				this.signCtx.draw(true)
				this.signCtx.beginPath()
				this.signCtx.moveTo(p.x, p.y)
			},
			onSignEnd() {
				this.drawing = false
			},
			clearPad() {
				if (!this.signCtx) return
				this.signCtx.setFillStyle('#ffffff')
				this.signCtx.fillRect(0, 0, 2000, 2000)
				this.signCtx.draw()
				this.signCtx.setStrokeStyle('#222222')
				this.signCtx.setLineWidth(4)
				this.signCtx.setLineCap('round')
				this.signCtx.setLineJoin('round')
				this.hasStroke = false
				this.drawing = false
			},
			confirmSign() {
				if (this.signing) return
				if (!this.hasStroke) {
					uni.showToast({ title: '请先完成手写签名', icon: 'none' })
					return
				}
				this.signing = true
				uni.canvasToTempFilePath({
					canvasId: 'merchantSignPad',
					fileType: 'png',
					success: (res) => {
						this.submitSign(res.tempFilePath)
					},
					fail: (err) => {
						console.error('导出签名失败', err)
						this.signing = false
						uni.showToast({ title: '签名生成失败，请重试', icon: 'none' })
					}
				}, this)
			},
			async submitSign(filePath) {
				try {
					const signImageUrl = await uploadFile(filePath, { loadingText: '提交签署中...' })
					await completeMySignApi(this.contractNo, signImageUrl)
					this.signPadVisible = false
					uni.showToast({ title: '签署完成', icon: 'success' })
					this.loadDetail()
				} catch (error) {
					console.error('签署失败', error)
				} finally {
					this.signing = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.detail-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx 24rpx 160rpx;
		box-sizing: border-box;
	}

	.empty-wrap {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.loading-text {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #999;
	}

	.info-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.name,
	.card-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 24rpx;
		padding: 10rpx 0;
	}

	.label {
		font-size: 26rpx;
		color: #999;
		flex-shrink: 0;
	}

	.value {
		font-size: 26rpx;
		color: #333;
		text-align: right;
	}

	.accent {
		color: #00a896;
	}

	.signer-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-top: 1rpx solid #f5f5f5;
	}

	.signer-row:first-of-type {
		border-top: none;
		padding-top: 0;
	}

	.signer-main {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.signer-role {
		font-size: 24rpx;
		color: #999;
	}

	.signer-name {
		font-size: 28rpx;
		color: #333;
	}

	.signer-status {
		font-size: 24rpx;
		color: #00a896;
	}

	.content {
		font-size: 26rpx;
		color: #333;
		line-height: 1.7;
		white-space: pre-wrap;
	}

	.sign-off {
		margin-top: 28rpx;
		padding-top: 24rpx;
		border-top: 1rpx dashed #e5e5e5;
	}

	.sign-off-label {
		display: block;
		font-size: 24rpx;
		color: #999;
		margin-bottom: 12rpx;
	}

	.sign-off-img {
		width: 360rpx;
		height: 160rpx;
		background: #fafafa;
	}

	.sign-off-empty {
		font-size: 24rpx;
		color: #ccc;
	}

	.submit-wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background: #fff;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.submit-btn {
		height: 88rpx;
	}

	.pad-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: flex-end;
	}

	.pad-sheet {
		width: 100%;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		padding: 32rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.pad-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}

	.pad-tip {
		display: block;
		font-size: 24rpx;
		color: #999;
		line-height: 1.6;
		margin-bottom: 20rpx;
	}

	.sign-canvas {
		width: 100%;
		height: 320rpx;
		background: #fff;
		border: 2rpx dashed #dcdcdc;
		border-radius: 12rpx;
	}

	.pad-actions {
		display: flex;
		gap: 16rpx;
		margin-top: 24rpx;
	}

	.pad-btn {
		flex: 1;
		height: 80rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
	}

	.pad-btn-plain {
		background: #f5f5f5;
		color: #333;
	}

	.pad-btn-ok {
		flex: 1.4;
		background: #00a896;
		color: #fff;
	}
</style>
