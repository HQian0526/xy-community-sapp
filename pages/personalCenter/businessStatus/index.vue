<template>
	<view class="status-page">
		<view class="status-card">
			<text class="status-label">当前状态</text>
			<view class="status-value-wrap">
				<view class="status-dot" :class="isOpenNow ? 'status-dot--open' : 'status-dot--closed'"></view>
				<text class="status-value" :class="isOpenNow ? 'status-value--open' : 'status-value--closed'">
					{{ displayStatus }}
				</text>
			</view>
			<text class="status-tip">{{ statusTip }}</text>
		</view>

		<view class="hours-card">
			<text class="hours-title">营业时间</text>
			<text class="hours-preview">{{ hoursPreview }}</text>

			<view class="preset-row">
				<text
					class="preset-chip"
					:class="{ 'preset-chip--active': hoursMode === 'all' }"
					@click="applyPreset('all')"
				>全天</text>
				<text
					class="preset-chip"
					:class="{ 'preset-chip--active': hoursMode === 'custom' && isEveryDay }"
					@click="applyPreset('everyday')"
				>每天</text>
				<text
					class="preset-chip"
					:class="{ 'preset-chip--active': hoursMode === 'custom' && isWeekdays }"
					@click="applyPreset('weekdays')"
				>周一至周五</text>
			</view>

			<view v-if="hoursMode === 'custom'" class="week-row">
				<text
					v-for="item in weekdayOptions"
					:key="item.value"
					class="week-chip"
					:class="{ 'week-chip--active': selectedDays.includes(item.value) }"
					@click="toggleDay(item.value)"
				>{{ item.label }}</text>
			</view>

			<view v-if="hoursMode === 'custom'" class="time-row">
				<picker mode="time" :value="startTime" @change="onStartChange">
					<view class="time-cell">
						<text class="time-label">开始</text>
						<text class="time-value">{{ startTime }}</text>
					</view>
				</picker>
				<text class="time-sep">至</text>
				<picker mode="time" :value="endTime" @change="onEndChange">
					<view class="time-cell">
						<text class="time-label">结束</text>
						<text class="time-value">{{ endTime }}</text>
					</view>
				</picker>
			</view>

			<view
				class="btn-success hours-save"
				:class="{ 'is-loading': hoursSubmitting }"
				@click="handleSaveHours"
			>{{ hoursSubmitting ? '保存中...' : '保存营业时间' }}</view>
		</view>

		<view class="submit-wrap">
			<view
				class="submit-btn"
				:class="[isManualOpen ? 'btn-gray-solid' : 'btn-success', { 'is-loading': submitting }]"
				@click="handleToggle"
			>
				{{ submitting ? '提交中...' : actionText }}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		STATUS_OPEN,
		STATUS_CLOSED,
		STATUS_CODE_OPEN,
		STATUS_CODE_CLOSED,
		statusCodeToLabel
	} from './mock.js'
	import {
		requireLogin,
		ensureUserInfo
	} from '@/common/auth.js'
	import {
		getStoreListApi,
		updateStoreApi,
		updateBusinessHoursApi,
		STORE_STATUS_CLOSED,
		getStoreOpenLabel,
		parseBusinessHours,
		formatBusinessHoursText
	} from '@/common/api/personalCenter/store.js'

	const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7]
	const WEEKDAYS = [1, 2, 3, 4, 5]

	function sameDays(a, b) {
		const left = [...new Set(a || [])].sort((x, y) => x - y).join(',')
		const right = [...new Set(b || [])].sort((x, y) => x - y).join(',')
		return left === right
	}

	export default {
		data() {
			return {
				currentStatus: STATUS_OPEN,
				acceptingOrders: true,
				storeId: null,
				storeRecordId: null,
				submitting: false,
				hoursSubmitting: false,
				hoursMode: 'all',
				selectedDays: [...ALL_DAYS],
				startTime: '08:00',
				endTime: '23:00',
				weekdayOptions: [
					{ label: '一', value: 1 },
					{ label: '二', value: 2 },
					{ label: '三', value: 3 },
					{ label: '四', value: 4 },
					{ label: '五', value: 5 },
					{ label: '六', value: 6 },
					{ label: '日', value: 7 }
				]
			}
		},
		computed: {
			isManualOpen() {
				return this.currentStatus === STATUS_OPEN
			},
			isOpenNow() {
				return this.isManualOpen && this.acceptingOrders !== false
			},
			displayStatus() {
				return getStoreOpenLabel({
					storeStatus: this.isManualOpen ? STATUS_CODE_OPEN : STATUS_CODE_CLOSED,
					acceptingOrders: this.acceptingOrders
				})
			},
			actionText() {
				return this.isManualOpen ? '打烊' : '开始营业'
			},
			statusTip() {
				if (!this.isManualOpen) {
					return '已打烊，用户暂时无法下单'
				}
				if (this.acceptingOrders === false) {
					return '当前不在营业时间内，用户暂时无法下单'
				}
				return '营业中，用户可正常下单'
			},
			isEveryDay() {
				return sameDays(this.selectedDays, ALL_DAYS)
			},
			isWeekdays() {
				return sameDays(this.selectedDays, WEEKDAYS)
			},
			hoursPreview() {
				if (this.hoursMode === 'all') {
					return '未限制时段，营业中视为全天可下单'
				}
				if (!this.selectedDays.length) {
					return '请选择营业星期'
				}
				return formatBusinessHoursText({
					rules: [{
						days: this.selectedDays,
						start: this.startTime,
						end: this.endTime
					}]
				})
			}
		},
		async onShow() {
			await this.loadStatus()
		},
		methods: {
			async loadStatus() {
				const ok = await requireLogin({
					force: true
				})
				if (!ok) return

				try {
					let userId = (await ensureUserInfo())?.id
					if (!userId) {
						uni.showToast({
							title: '未获取到用户信息',
							icon: 'none'
						})
						return
					}

					const data = await getStoreListApi({
						userId
					})
					const list = Array.isArray(data) ? data : (data?.list || [])
					const store = list[0]
					if (!store) {
						uni.showToast({
							title: '未找到店铺信息',
							icon: 'none'
						})
						return
					}

					this.storeRecordId = store.id
					this.storeId = store.storeId
					this.currentStatus = statusCodeToLabel(store.storeStatus)
					this.acceptingOrders = store.acceptingOrders !== false
					this.applyHoursFromStore(store)
				} catch (error) {
					console.error('获取营业状态失败', error)
				}
			},
			applyHoursFromStore(store) {
				const hours = parseBusinessHours(store.businessHours)
				const rule = (hours.rules || [])[0]
				if (!rule || !(rule.days || []).length) {
					this.hoursMode = 'all'
					this.selectedDays = [...ALL_DAYS]
					this.startTime = '08:00'
					this.endTime = '23:00'
					return
				}
				this.hoursMode = 'custom'
				this.selectedDays = [...new Set((rule.days || []).map(Number))].filter((d) => d >= 1 && d <= 7)
				this.startTime = rule.start || '08:00'
				this.endTime = rule.end || '23:00'
			},
			applyPreset(type) {
				if (type === 'all') {
					this.hoursMode = 'all'
					return
				}
				this.hoursMode = 'custom'
				this.selectedDays = type === 'weekdays' ? [...WEEKDAYS] : [...ALL_DAYS]
			},
			toggleDay(value) {
				const index = this.selectedDays.indexOf(value)
				if (index === -1) {
					this.selectedDays = [...this.selectedDays, value].sort((a, b) => a - b)
					return
				}
				if (this.selectedDays.length === 1) {
					uni.showToast({
						title: '至少选择一天',
						icon: 'none'
					})
					return
				}
				this.selectedDays = this.selectedDays.filter((item) => item !== value)
			},
			onStartChange(e) {
				this.startTime = e.detail.value
			},
			onEndChange(e) {
				this.endTime = e.detail.value
			},
			timeToMinutes(value) {
				const parts = String(value || '').split(':')
				return Number(parts[0]) * 60 + Number(parts[1])
			},
			async handleSaveHours() {
				if (this.hoursSubmitting) return
				let payload = {
					rules: []
				}
				if (this.hoursMode === 'custom') {
					if (!this.selectedDays.length) {
						uni.showToast({
							title: '请选择营业星期',
							icon: 'none'
						})
						return
					}
					if (this.timeToMinutes(this.startTime) >= this.timeToMinutes(this.endTime)) {
						uni.showToast({
							title: '结束时间必须晚于开始时间',
							icon: 'none'
						})
						return
					}
					payload = {
						rules: [{
							days: this.selectedDays,
							start: this.startTime,
							end: this.endTime
						}]
					}
				}
				this.hoursSubmitting = true
				try {
					const saved = await updateBusinessHoursApi(payload)
					if (saved && saved.acceptingOrders != null) {
						this.acceptingOrders = saved.acceptingOrders !== false
					}
					this.applyHoursFromStore(saved || payload)
					uni.showToast({
						title: '营业时间已保存',
						icon: 'success'
					})
				} catch (error) {
					console.error('保存营业时间失败', error)
				} finally {
					this.hoursSubmitting = false
				}
			},
			handleToggle() {
				if (this.submitting) return
				if (!this.storeRecordId) {
					uni.showToast({
						title: '未找到店铺信息',
						icon: 'none'
					})
					return
				}

				const nextCode = this.isManualOpen ? STATUS_CODE_CLOSED : STATUS_CODE_OPEN
				const nextLabel = nextCode === STORE_STATUS_CLOSED ? STATUS_CLOSED : STATUS_OPEN
				const content = this.isManualOpen
					? '确定要打烊吗？打烊后用户将无法下单'
					: '确定要开始营业吗？'

				uni.showModal({
					title: '提示',
					content,
					success: async (res) => {
						if (!res.confirm) return
						this.submitting = true
						try {
							await updateStoreApi({
								id: this.storeRecordId,
								storeStatus: nextCode
							})
							this.currentStatus = nextLabel
							await this.loadStatus()
							uni.showToast({
								title: this.isManualOpen ? '已开始营业' : '已打烊',
								icon: 'success'
							})
						} catch (error) {
							console.error('更新营业状态失败', error)
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

	.status-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.status-card,
	.hours-card {
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.status-card {
		padding: 48rpx 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.status-label {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 32rpx;
	}

	.status-value-wrap {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.status-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
	}

	.status-dot--open {
		background-color: $primary;
	}

	.status-dot--closed {
		background-color: #999;
	}

	.status-value {
		font-size: 40rpx;
		font-weight: 700;
	}

	.status-value--open {
		color: $primary;
	}

	.status-value--closed {
		color: #666;
	}

	.status-tip {
		font-size: 26rpx;
		color: #999;
		text-align: center;
		line-height: 1.5;
	}

	.hours-card {
		margin-top: 24rpx;
		padding: 32rpx;
	}

	.hours-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.hours-preview {
		display: block;
		margin-top: 12rpx;
		font-size: 26rpx;
		color: $primary;
		line-height: 1.5;
	}

	.preset-row,
	.week-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 28rpx;
	}

	.preset-chip,
	.week-chip {
		padding: 10rpx 24rpx;
		border-radius: 28rpx;
		font-size: 24rpx;
		color: #666;
		background-color: #f5f5f5;
	}

	.preset-chip--active,
	.week-chip--active {
		color: #fff;
		background-color: $primary;
	}

	.week-chip {
		width: 64rpx;
		padding: 12rpx 0;
		text-align: center;
	}

	.time-row {
		display: flex;
		align-items: center;
		margin-top: 28rpx;
		gap: 16rpx;
	}

	.time-cell {
		flex: 1;
		min-width: 200rpx;
		padding: 20rpx 24rpx;
		border-radius: 12rpx;
		background-color: #f7f8fa;
	}

	.time-label {
		display: block;
		font-size: 22rpx;
		color: #999;
		margin-bottom: 8rpx;
	}

	.time-value {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.time-sep {
		flex-shrink: 0;
		font-size: 26rpx;
		color: #999;
	}

	.hours-save {
		margin-top: 32rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		font-weight: 600;
	}

	.hours-save.is-loading,
	.submit-btn.is-loading {
		opacity: 0.7;
	}

	.submit-wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 24rpx 48rpx calc(24rpx + env(safe-area-inset-bottom));
		background-color: #fff;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.submit-btn {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: 600;
		text-align: center;
		border-radius: 44rpx;
	}

	.btn-gray-solid {
		color: #fff;
		background-color: #999;
	}
</style>
