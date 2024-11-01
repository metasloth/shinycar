import e, { json } from 'express'
import express from 'express'
import { getLogger } from './util/logger'
import { ofac } from './ofac'

import { getStorage, getDownloadURL } from 'firebase-admin/storage'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { normalizeError } from './util/error'
import 'dotenv/config'

// Initialize the Firebase SDK.
const firebaseApp = initializeApp({
  // This requires GOOGLE_APPLICATION_CREDENTIALS to be correctly set.
  credential: applicationDefault(),
  storageBucket: process.env['STORAGE_BUCKET'],
})

console.log('storage', firebaseApp.options.storageBucket)
interface NameParam {
  firstName: string
  lastName: string
  fullName: string
}

// Setup express w/ JSON parsing
const app = express()
app.use(e.json())

// Express Routes
app.get('/', (req: e.Request, res: e.Response) => {
  res.send('hello there!')
})

app.get('/ofac', async (req: e.Request, res: e.Response) => {
  const log = await getLogger()
  log.info(log.entry({ message: 'Single ofac request', url: req.url }))

  // Check for the name in the query parameter
  const name = req.query.name as string
  if (!name) {
    log.info(log.entry({ message: 'No name provided!', url: req.url }))
    res.json({ success: false, error: 'No name provided!' })
    return
  }

  // Perform OFAC
  log.debug(log.entry(`Fetching data for ${name}`))
  const ofacResult = await ofac(name)
  if ('_err' in ofacResult) {
    log.error(
      log.entry({}, { message: 'Uh Oh', err: normalizeError(ofacResult._err) })
    )
    res.json({ success: false, error: 'Error with puppeteer!' })
    return
  }

  // Connect to GCS
  log.debug(log.entry('Instatiating GCS Connection'))
  const storage = getStorage(firebaseApp)
  const bucket = storage.bucket(firebaseApp.options.storageBucket)

  // Save file
  const fileDate = new Date().toISOString().split('.')[0].replace(/:|-/g, '')
  const filename = `${fileDate}_${name.replace(/\s/g, '')}.pdf`
  log.debug(log.entry({ message: `Saving to GCS: ${filename}`, filename }))
  const file = bucket.file(`single/${filename}`)
  await file.save(ofacResult.pdf)

  // Return download URL of our file
  const downloadLink = await getDownloadURL(file)

  log.info(
    log.entry({ message: 'Successful single ofac check', name, filename })
  )
  res.json({ success: true, downloadLink })
})

app.post('/ofac', async (req: e.Request, res: e.Response) => {
  const log = await getLogger()
  const body = req.body as NameParam
  log.info(log.entry(`Fetching data for ${body.firstName}`))

  // Perform OFAC
  const fullName = `${body.firstName} ${body.lastName}`
  const ofacResult = await ofac(fullName)
  if ('_err' in ofacResult) {
    log.error(
      log.entry({}, { message: 'Uh Oh', err: normalizeError(ofacResult._err) })
    )
    res.json({ success: false })
    return
  }

  log.info(log.entry('Saving PDF'))

  res.json({ success: true, pdf: ofacResult.pdf })
})

app.listen(process.env.PORT || 8080)
