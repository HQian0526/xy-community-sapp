import {
	STORE_STATUS_OPEN,
	STORE_STATUS_CLOSED,
	getStoreStatusLabel
} from '@/common/api/personalCenter/store.js'

export const STATUS_OPEN = '营业中'
export const STATUS_CLOSED = '打烊'
export const STATUS_CODE_OPEN = STORE_STATUS_OPEN
export const STATUS_CODE_CLOSED = STORE_STATUS_CLOSED

export const DEFAULT_STATUS = STATUS_OPEN

export function statusCodeToLabel(storeStatus) {
	return getStoreStatusLabel(storeStatus)
}

export function statusLabelToCode(label) {
	return label === STATUS_CLOSED ? STORE_STATUS_CLOSED : STORE_STATUS_OPEN
}
