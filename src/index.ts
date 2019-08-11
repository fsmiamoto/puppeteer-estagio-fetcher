import dotenv from 'dotenv'
import fs from 'fs'
import { argv } from 'yargs'

import { getAllOffersFromCampus, getOffers } from './offers'
import { checkCredentials, checkArgs } from './checkers'

dotenv.config()

const OUTPUT_FILENAME = 'ofertas.json'

const { RA, SENHA } = process.env

async function fetch () {
  try {
    checkCredentials(RA, SENHA)
    checkArgs(argv)

    const { curso, campus } = argv

    if (curso) {
      console.log(`Obtendo ofertas de ${curso} no campus ${campus}`)
      const offers = await getOffers(curso, campus, RA, SENHA)
      fs.writeFileSync(OUTPUT_FILENAME, JSON.stringify(offers, null, 2))
      console.log(`Ofertas salvas em ${OUTPUT_FILENAME}`)
    } else {
      console.log(`Obtendo ofertas no campus ${campus}`)
      const offers = await getAllOffersFromCampus(campus, RA, SENHA)
      fs.writeFileSync(OUTPUT_FILENAME, JSON.stringify(offers, null, 2))
      console.log(`Ofertas salvas em ${OUTPUT_FILENAME}`)
    }
  } catch (err) {
    console.log(`Erro: ${err.message}`)
  }
}

fetch()
