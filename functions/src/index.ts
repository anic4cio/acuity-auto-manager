import axios from 'axios'
import envs from './envs'
import sendReportToSlack from './reportSender'
import { HttpFunction } from '@google-cloud/functions-framework'
import requestValidator from './requestValidator'
import auth from './auth'

interface IAcuityAppointment {
  id: number,
  firstName: string,
  lastName: string,
  phone?: string,
  email?: string,
  date: string,
  time?: string,
  endTime?: string,
  dateCreated?: string,
  datetime: Date,
  price?: string | number,
  paid: string | boolean,
  amountPaid?: string | number,
  type?: string,
  appointmentTypeID?: number,
  addonIDs?: number[],
  classID?: number,
  duration?: string,
  calendar?: string,
  calendarID: number,
  canClientCancel?: boolean,
  canClientReschedule?: boolean,
  location?: string,
  confirmationPage?: string,
  formsText?: string,
  notes: string,
  timezone?: string,
  forms?: object[],
  labels?: object[]
}

export interface IAcuityAppointmentComplete extends IAcuityAppointment {
  dateCreated: string
}

const route: HttpFunction = async (req, res) => {
  auth(req, res)
  const reqValidation = requestValidator(req)
  if (!reqValidation.success)
    return res.status(reqValidation.code).json(reqValidation)
  const lateWeddings = await getLateWeddingsToCancel()

  if (req.method === 'PUT') {
    const weddingsToReport = []
    for (const lateWedd of lateWeddings) {
      const id = lateWedd.id
      const canceledWedd = await cancelLateWeddings(id)
      weddingsToReport.push(canceledWedd)
    }
    const responseReportMsg = prepareReports(weddingsToReport)
    await sendReportToSlack(responseReportMsg, weddingsToReport)
  } else if (req.method === 'GET') {
    const responseReportMsg = prepareReports(lateWeddings)
    await sendReportToSlack(responseReportMsg, lateWeddings)
  }
}

const getLateWeddingsToCancel = async () => {
  const today = getBrazilianDate()
  const weddingsAbleToCancel = await getWeddingsAbleToCancel()
  const lateWeddings = weddingsAbleToCancel
    .filter(lateWedds => {
      const dateCreated = turnStringToDate(lateWedds.dateCreated)
      const daysLate = getDaysBetweenTwoDates(dateCreated, today)
      if (daysLate > 8) return lateWedds
    })
  return lateWeddings
}

const turnStringToDate = (dateString: string) => new Date(dateString)

const getDaysBetweenTwoDates = (first: Date, second: Date) =>
  Math.round((second.getTime() - first.getTime()) / (1000 * 60 * 60 * 24))

const getWeddingsAbleToCancel = async () => {
  const appointments = await getWeddingsOfAllCalendars()
  const regex = /^\s*([Aa]\s*-|[Ss]\s*-)\s*/gm
  const validAppointments = appointments.filter((a): a is IAcuityAppointmentComplete => {
    if (
      !a.firstName.match(regex) &&
      !a.lastName.match(regex) &&
      a.paid != 'yes' &&
      !a.notes &&
      a.dateCreated
    ) return true
    return false
  })
  return validAppointments
}

const getWeddingsOfAllCalendars = async () => {
  const weddingsOfClassic = await getWeddingsUntil90Days(1)
  const weddingsOfRio = await getWeddingsUntil90Days(2)
  const weddingsOfExternal = await getWeddingsUntil90Days(3)
  const weddingsOfAllCalendars = weddingsOfClassic
    .concat(weddingsOfRio, weddingsOfExternal)
  return weddingsOfAllCalendars
}

const getWeddingsUntil90Days = async (calendarId: number) => {
  const today = getBrazilianDate()
  const minDate = formatDate(getBrazilianDate())
  const maxDate = formatDate(getDatePlusDays(today, 90))
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: envs.acuityAuth,
    },
  }
  const response = await axios.get<IAcuityAppointment[]>(
    `https://acuityscheduling.com/api/v1/appointments?minDate=${minDate}&maxDate=${maxDate}&calendarID=${calendarId}&canceled=false&excludeForms=true&direction=DESC`,
    options
  )
  return response.data
}

const getBrazilianDate = () => {
  const todayString = new Date().toLocaleString('en-US', {
    timeZone: 'America/Sao_Paulo',
  })
  const todayMs = Date.parse(todayString)
  return new Date(todayMs)
}

const formatDate = (date: Date) => date.toLocaleDateString().replaceAll('/', '-')

const getDatePlusDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const cancelLateWeddings = async (id: number) => {
  const options = {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': envs.acuityAuth,
    },
    data: { noShow: false },
  }
  const response = await axios.put<IAcuityAppointmentComplete>(
    `https://acuityscheduling.com/api/v1/appointments/${id}/cancel`,
    options
  )
  return response.data
}

const prepareReports = (canceledWeddings: IAcuityAppointmentComplete[]) => {
  let responseReport = `Relatório do Cancelamento:
  `
  canceledWeddings.forEach(wedd => {
    responseReport = `${responseReport}
> Nome: *${wedd.firstName} ${wedd.lastName}* / Email: ${wedd.email} / Data: ${wedd.date}`
  })
  responseReport = `${responseReport}
Total de agendamentos tratados: ${canceledWeddings.length}`
  return responseReport
}

module.exports = {
  route
}
