import { httpsCallable } from 'firebase/functions'

import { functions } from '@/config/firebaseConfig'

export const callableFireFunction = async <TResponse, TRequest = unknown>(
	functionName: string,
	payload: TRequest
): Promise<TResponse> => {
	try {
		const callableFunction = httpsCallable<TRequest, TResponse>(functions, functionName)
		const result = await callableFunction(payload)
		return result.data
	} catch (error) {
		console.error(`Error calling Firebase function '${functionName}':`, {
			error,
			payload,
			functionName,
		})
		throw error
	}
}
