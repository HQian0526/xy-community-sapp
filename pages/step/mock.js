import { getOrderById } from '../order/mock.js'

const CURRENT_MAP = {
	dispatching: 1,
	dispatched: 2
}

function buildSteps(order) {
	const isDispatching = order.statusType === 'dispatching'
	const isDispatched = order.statusType === 'dispatched'

	return [
		{
			title: '任务发布',
			desc: order.submitTime
		},
		{
			title: '等待接单',
			desc: isDispatching ? '正在为您匹配合适的邻居' : '已有邻居接单'
		},
		{
			title: '已派单',
			desc: isDispatched ? `接单人：${order.repairer}` : '等待接单中'
		},
		{
			title: '任务进行中',
			desc: isDispatched ? '接单人正在处理您的任务' : '等待开始'
		},
		{
			title: '任务完成',
			desc: '等待确认完成'
		}
	]
}

export function getOrderProgress(id) {
	const order = getOrderById(id)
	return {
		order,
		current: CURRENT_MAP[order.statusType] ?? 1,
		steps: buildSteps(order)
	}
}
