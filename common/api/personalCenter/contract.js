import {
	get,
	post
} from '../request.js'

export function getMyContractListApi(params) {
	return get('/esign/contract/my', params)
}

export function getMyContractDetailApi(contractNo) {
	return get(`/esign/contract/my/${contractNo}`)
}

export function completeMySignApi(contractNo, signImageUrl) {
	return post(`/esign/contract/my/sign/${contractNo}/complete`, {
		signImageUrl
	})
}
