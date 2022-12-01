import axios from 'axios'

interface AcuityParams {
  max?: number,
  minDate?: Date,
  maxDate?: Date,
  calendarID?: number,
  appointmentTypeId?: number,
  canceled: boolean,
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string,
  fieldID?: string,
  excludeForms?: boolean,
  direction: 'ASC' | 'DESC'
}

const getDatePlus = (date: Date, days: number): Date => {
  // eslint-disable-next-line prefer-const
  let result: Date = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const getWeddingsBefore90Days = async (params: AcuityParams): Promise<object[]> => {
  const options = {
    method: 'GET',
    url: process.env.API_KEY,
    params,
    headers: {
      accept: 'application/json',
      authorization: process.env.API_URL,
    }
  }

  try {
    const response: Promise<object[]> = await axios.request(options)
      .then(res => res)
      .catch(err => console.error(err))
    return response
  } catch (err) {
    console.error(err)
    throw err
  }
}

const today = new Date()
const dateStart = getDatePlus(today,  8)
const dateEnd = getDatePlus(dateStart, 90)

const params: AcuityParams = { 
  max: 100, 
  minDate: dateStart,
  maxDate: dateEnd,
  calendarID: 99,
  canceled: false, 
  excludeForms: false, 
  direction: 'DESC'
}

const getWeddingsAbleToCancel = async () => {
  const appointments: object[] = await getWeddingsBefore90Days(params)
  const validAppointments = appointments.filter((appointment: object) => {
    if (appointment.paid == 'no' && !appointment.notes) 
      return appointment
  })
  return validAppointments
}

