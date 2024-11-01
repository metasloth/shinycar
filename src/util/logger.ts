import { Logging } from '@google-cloud/logging'

// Get a new logger
export async function getLogger() {
  const logging = new Logging()
  await logging.setProjectId()
  await logging.setDetectedResource()

  const log = logging.logSync('shinycar')
  return log
}
