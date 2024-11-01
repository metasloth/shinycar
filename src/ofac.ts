import * as puppeteer from 'puppeteer'
import { getLogger } from './util/logger'
const url = 'https://sanctionssearch.ofac.treas.gov/'
const NameSelector = 'input[name*=LastName'
const searchSelector = 'input[value=Search]'

export async function ofac(
  fullName: string
): Promise<{ pdf: Uint8Array } | { _err: Error }> {
  const log = await getLogger()
  // try {
  log.info(log.entry('Creating Browser!'))
  const browser = await puppeteer.launch({ headless: true })

  // const browser = await chromium.puppeteer.launch({
  //   args: chromium.args,
  //   defaultViewport: chromium.defaultViewport,
  //   executablePath: await chromium.executablePath,
  //   headless: chromium.headless,
  //   ignoreHTTPSErrors: true,
  // })

  log.info(log.entry('Creating page!'))
  const page = await browser.newPage()

  await page.goto(url, {
    waitUntil: 'networkidle2',
  })

  // Enter search
  log.info(log.entry('Searching page!'))
  await page.type(NameSelector, fullName)
  await page.click(searchSelector)
  await page.waitForNetworkIdle()

  // Check for results or not
  log.info(log.entry('Saveing page!'))
  const pdfBlob = await page.pdf({
    path: 'test.ofac.pdf',
    format: 'letter',
    displayHeaderFooter: true,
    headerTemplate: `<div>
    <span class="date" style="font-size:15px"></span>
    <span class="title" style="font-size:15px;float:right"></span></div>`,
    footerTemplate: `
    <div style="width:100%">
    <span class="url" style="font-size:15px"></span>
    <span class="pageNumber" style="font-size:15px;float:right"></span>
    <span style="font-size:15px;float:right">/</span>
    <span class="totalPages" style="font-size:15px;float:right"></span>
    </div>
    `,
  })
  await browser.close()
  return { pdf: pdfBlob }
  // } catch (err) {
  //   logger.error('Caugtr error in ofac', { err: err })
  //   return { err: err }
  // }
}
