import moment from 'moment'
import momentJalaali from 'moment-jalaali'

moment.locale('fa')

export const jalaliDate = (date: Date): string => {
  return moment(date).format('jYYYY/jMM/jDD')
}

export const jalaliTime = (date: Date): string => {
  return moment(date).format('HH:mm')
}

export const jalaliDateTime = (date: Date): string => {
  return moment(date).format('jYYYY/jMM/jDD HH:mm')
}

export const toJalali = (gregorianDate: Date): { year: number; month: number; day: number } => {
  const jDate = moment(gregorianDate).jDate()
  const jMonth = moment(gregorianDate).jMonth()
  const jYear = moment(gregorianDate).jYear()
  
  return {
    year: jYear,
    month: jMonth + 1, // moment returns month 0-11
    day: jDate
  }
}

export const toGregorian = (jalaliYear: number, jalaliMonth: number, jalaliDay: number): Date => {
  return moment.jalaali(jalaliYear, jalaliMonth - 1, jalaliDay).toDate()
}
