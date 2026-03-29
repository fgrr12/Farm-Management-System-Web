export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type Nullable<T> = T | null

export type RequiredNonNullable<T> = {
	[K in keyof T]: NonNullable<T[K]>
}
