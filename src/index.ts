import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
import cheerio from 'cheerio'
import fs from 'fs'

import campusCodes from '../codigo_campus.json'
import courseCodes from '../codigo_cursos.json'

dotenv.config()

interface Offer {
  code: string;
  description: string;
  jobType: string;
  date: string;
  courses: string[];
}

const WAIT_TIME = 500 // in miliseconds
const SELECTED_CAMPUS = 'Curitiba'

async function fetchOffers (): Promise<Offer[]> {
  const offers: Offer[] = []

  for (let courseName of Object.keys(courseCodes)) {
    console.log(`Fetching offers of ${courseName}...`)
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.goto('http://estagio.utfpr.edu.br')

      const frames = await page.frames()

      const menuFrame = frames[1]
      const campusFrame = frames[2]

      // Selects Curitiba campus
      await campusFrame.select(
        'select[name="p_campuscodigo"]',
        campusCodes[SELECTED_CAMPUS]
      )

      const loginButton = await campusFrame.$('input[value="Logar >>"]')
      await loginButton.click()

      await page.waitFor(WAIT_TIME)

      const studentLink = await menuFrame.$("a[href='login_aluno.php']")
      await studentLink.click()

      await page.waitFor(WAIT_TIME)

      const idField = await campusFrame.$("input[name='p_alunomatricula']")
      await idField.type(process.env.STUDENT_ID)

      const passwordField = await campusFrame.$("input[name='p_alunosenha']")
      await passwordField.type(process.env.STUDENT_PASSWORD)

      await campusFrame.click("input[value='Login aluno »']")

      await page.waitFor(WAIT_TIME)

      await page.goto('https://estagio.utfpr.edu.br/combo_oferta.php')
      await page.waitFor(WAIT_TIME)

      await page.select(
        'select[name="p_combocurso"]',
        `${courseCodes[courseName]}`
      )

      const confirmButton = await page.$('input[value=" Confirmar >>"]')
      await confirmButton.click('')
      await page.waitFor(WAIT_TIME)

      const content = await page.content()
      const $ = cheerio.load(content)

      // TODO: Refactor
      $('table[bgcolor="#90ACD6"] tr').each(function (this: CheerioElement, i) {
        const newOffer: Offer = {
          code: '',
          description: '',
          jobType: '',
          date: '',
          courses: []
        }

        // Skip first 2 header rows
        if (i < 3) return

        $(this)
          .children('td')
          .each(function (this: CheerioElement, i): void {
            const text = $(this)
              .text()
              .trim()
            if (i === 1) newOffer.code = text
            else if (i === 2) newOffer.description = text
            else if (i === 4) newOffer.jobType = text
            else if (i === 5) newOffer.date = text
          })

        const alreadyHasOffer = offers.find(
          offer => offer.code === newOffer.code
        )
        if (alreadyHasOffer === undefined) {
          newOffer.courses.push(courseName)
          offers.push(newOffer)
        } else {
          alreadyHasOffer.courses.push(courseName)
        }
      })

      await browser.close()
    } catch (err) {
      console.error(err)
    }
  }

  return offers
}

(async () => {
  const offers = await fetchOffers()
  fs.writeFileSync('./ofertas.json', JSON.stringify(offers, null, 2), 'utf-8')
})()
