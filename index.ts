import axios from 'axios'
import { AcuityAppointment, AcuityParams } from './interfaces'

// returns a date plus number of days
const getDatePlusDays = (date: Date, days: number): Date => {
  let result: Date = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// returns today's date in brazilian timezone as a Date Object
const getBrazilianDate = (): Date => {
  const todayString: string = new Date()
    .toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  const todayMs: number = Date.parse(todayString)
  const todayDate: Date = new Date(todayMs)
  return todayDate
}

const today: Date = getBrazilianDate()
const dateBefore8Days: Date = getDatePlusDays(today, 8)
const dateBefore90Days: Date = getDatePlusDays(dateBefore8Days, 90)

const params: AcuityParams = {
  max: 100,
  minDate: dateBefore8Days,
  maxDate: dateBefore90Days,
  calendarID: 99,
  canceled: false,
  excludeForms: false,
  direction: 'DESC'
};

// get wedding appointments between 8 and 90 days of deadline
const getWeddingsBefore90Days = async (params: AcuityParams): Promise<object[] | void> => {
  const options = {
    method: 'GET',
    params: params,
    headers: {
      accept: 'application/json',
      authorization: process.env.API_KEY,
    }
  }
  try {
    const response: Promise<object[] | void> = axios
      .get('https://acuityscheduling.com/api/v1/appointments', options)
      .then(res => console.log(res))
      .catch(err => console.error(err))
    return response
  } catch (err) {
    console.error(err)
    throw err
  }
}

// remove specific appointments, which initiates with A- and S-, have notes' content and it's paid
const getWeddingsAbleToCancel = async () => {
  const regex = /^(A-|S-)\s*/gm
  const appointments = await getWeddingsBefore90Days(params)
  const validAppointments = appointments!.filter((appointment: AcuityAppointment) => {
    if (
      !appointment.firstName!.match(regex) &&
      !appointment.lastName!.match(regex) &&
      appointment.paid != 'yes' &&
      !appointment.notes
    ) return appointment
  })
  return validAppointments
}

const getLateWeddingsToCancel = async (): Promise<object[]> => {
  const today = getBrazilianDate()
  const weddingsAbleToCancel = await getWeddingsAbleToCancel()
  const lateWeddings = weddingsAbleToCancel.filter((late: AcuityAppointment) => {
    if (late.datetime! < today) {
      return late
    }
  })
  return lateWeddings
}

const cancelLateWeddings = async (id: number): Promise<object[] | void> => {
  const options = {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: process.env.API_KEY,
    },
    data: {noShow: false}
  }
  try {
    const response: Promise<object[] | void> = axios
      .get(`https://acuityscheduling.com/api/v1/appointments/${id}/cancel`, options)
      .then(res => console.log(res))
      .catch(err => console.error(err))
    return response
  } catch (err) {
    console.error(err)
    throw err
  }
}

const start = async () => {
  const lateWeddings: object[] = await getLateWeddingsToCancel()
  lateWeddings.forEach((lateWedd: AcuityAppointment) => {
    let id: number = lateWedd.id!
    cancelLateWeddings(id)
  });
}
