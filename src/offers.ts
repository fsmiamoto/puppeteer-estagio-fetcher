import puppeteer from 'puppeteer'
import cheerio from 'cheerio'

import campusCodes from '../codigo_campus.json'
import majorCodes from '../codigo_cursos.json'

interface Offer {
  code: string;
  description: string;
  jobType: string;
  date: string;
  majors: string[];
}

const URL = 'http://estagio.utfpr.edu.br'

// Tempo entre ações na página (valor empírico)
const WAIT_TIME = 250 // ms

/**
 * Obtém ofertas dos sistema de estágio
 * @param major: Nome do curso como em codigo_cursos
 * @param campus: Nome do campus
 * @param studentId: Registro acadêmico
 * @param studentPassword: Senha do PORTAL DE ESTÁGIOS
 */
export async function getOffers (
  major: string,
  campus: string,
  studentId: string,
  studentPassword: string
) {
  const offers: Offer[] = []

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(URL)

  const frames = await page.frames()

  const menuFrame = frames[1]
  const campusFrame = frames[2]

  // Selects Curitiba campus
  await campusFrame.select(
    'select[name="p_campuscodigo"]',
    campusCodes[campus]
  )

  const loginButton = await campusFrame.$('input[value="Logar >>"]')
  await loginButton.click()

  await page.waitFor(WAIT_TIME)

  const studentLink = await menuFrame.$("a[href='login_aluno.php']")
  await studentLink.click()

  await page.waitFor(WAIT_TIME)

  const idField = await campusFrame.$("input[name='p_alunomatricula']")
  await idField.type(studentId)

  const passwordField = await campusFrame.$("input[name='p_alunosenha']")
  await passwordField.type(studentPassword)

  await campusFrame.click("input[value='Login aluno »']")

  await page.waitFor(WAIT_TIME)

  await page.goto('https://estagio.utfpr.edu.br/combo_oferta.php')
  await page.waitFor(WAIT_TIME)

  await page.select(
    'select[name="p_combocurso"]',
    `${majorCodes[major]}`
  )

  const confirmButton = await page.$('input[value=" Confirmar >>"]')
  await confirmButton.click()
  await page.waitFor(WAIT_TIME)

  const content = await page.content()
  const $ = cheerio.load(content)

  $('table[bgcolor="#90ACD6"] tr').each(function (this: CheerioElement, i) {
    const newOffer: Offer = {
      code: '',
      description: '',
      jobType: '',
      date: '',
      majors: [major]
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

    offers.push(newOffer)
  })

  await browser.close()

  return offers
}

/**
 * Obtém todas as ofertas de um campus
 * @param campus: Nome do campus
 * @param studentId: Registro Acadêmico
 * @param studentPassword: Senha do PORTAL DE ESTÁGIOS
 * @returns Offer[]
 */
export async function getAllOffersFromCampus (campus: string, studentId: string, studentPassword: string): Promise<Offer[]> {
  const allOffers: Offer[] = []

  for (let majorName of Object.keys(majorCodes)) {
    console.log(`Obtendo ofertas de ${majorName}...`)
    const majorOffers = await getOffers(majorName, campus, studentId, studentPassword)

    for (let newOffer of majorOffers) {
      const alreadyHasOffer = allOffers.find(offer => offer.code === newOffer.code)

      if (alreadyHasOffer === undefined) {
        newOffer.majors.push(majorName)
        allOffers.push(newOffer)
      } else {
        alreadyHasOffer.majors.push(...newOffer.majors)
      }
    }
  }

  return allOffers
}
