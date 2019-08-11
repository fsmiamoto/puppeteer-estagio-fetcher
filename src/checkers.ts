import campusCodes from '../codigo_campus.json'
import majorCodes from '../codigo_cursos.json'

export function checkCredentials (id?:string, password?: string) {
  if (id === undefined) {
    throw new Error('Registro acadêmico faltando!')
  } else if (password === undefined) {
    throw new Error('Senha faltando! ')
  }
}

export function checkArgs (argv: {[x:string]: unknown, _: string[], '$0': string}) {
  const { curso, campus } = argv
  if (campus === undefined) {
    throw new Error('Campus faltando!')
  } else if (campusCodes[campus] === undefined) {
    throw new Error('Campus não encontrado!')
  } else if (curso && majorCodes[curso] === undefined) {
    throw new Error('Curso não encontrado!')
  }
}
