type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type Nullable<T> = T | null

type RequiredNonNullable<T> = {
	[K in keyof T]: NonNullable<T[K]>
}
