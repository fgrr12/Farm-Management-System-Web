import { httpsCallable } from 'firebase/functions'

import { functions } from '@/config/firebaseConfig'

export const callableFireFunction = async <TResponse, TRequest = unknown>(
	functionName: string,
	payload: TRequest
): Promise<TResponse> => {
	const callableFunction = httpsCallable<TRequest, { data: TResponse }>(functions, functionName)
	const result = await callableFunction(payload)
	return result.data.data
}
