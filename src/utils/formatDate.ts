import dayjs from 'dayjs'

export const formatDate = (date: dayjs.Dayjs | string) => {
	return dayjs(date).toISOString()
}
