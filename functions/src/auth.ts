import envs from './envs'
import { Request, Response } from '@google-cloud/functions-framework'

type tokenType = string | string[] | undefined

export default (req: Request, res: Response) => {
  const authenticate = () => {
    const tokenReceived = req.headers?.['x-access-token']
    if (tokenReceived) {
      const ownToken = getOwnToken()
      return compareReceivedToken(tokenReceived, ownToken)
    } else {
      return res.status(401).json({
        success: false,
        message: 'No token provided.',
      })
    }
  }

  const getOwnToken = () => envs.cloudFunctionToken

  const compareReceivedToken = (tokenReceived: tokenType, ownToken: tokenType) => {
    if (tokenReceived !== ownToken) {
      return res.status(403).json({
        success: false,
        message: 'Failed to authenticate token.',
      })
    } else return
  }

  authenticate()
}
