import { LogLevel, WebClient } from '@slack/web-api'
// eslint-disable-next-line import/namespace
import { IAcuityAppointmentComplete } from './index'
import envs from './envs'

export default async (message: string, reportData: IAcuityAppointmentComplete[]) => {
  const channelId = 'C049Q3AC553'
  const today = new Date()
    .toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .replaceAll('/', '-')
    .split(' ')[0]

  const client = new WebClient(envs.slackToken, { logLevel: LogLevel.INFO })
  const jsonBuffer = Buffer.from(JSON.stringify(reportData))

  try {
    await client.files.uploadV2({
      initial_comment: message,
      channel_id: channelId,
      file: jsonBuffer,
      filename: `cancelados-agenda-${today}.json`,
    })
  } catch (error) {
    console.error('Failed to send report message to slack', error)
    throw error
  }
}
