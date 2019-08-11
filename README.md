#puppeteer-estagio-fetcher

Teste do uso da biblioteca [Puppeteer](https://github.com/googlechrome/puppeteer) para obter vagas de estágio do portal da UTFPR.

### Dependências
- Node.js
- NPM ou Yarn (preferido)

## Como testar
### Setup
```bash
# Clone o projeto
$ git clone https://github.com/fsmiamoto/puppeteer-estagio-fetcher.git

# Mova-se para o novo diretório
$ cd puppeteer-estagio-fetcher

# Instale as dependências
$ yarn install

# Adicione arquivo .env com suas credenciais
$ echo 'RA=1234567\nSENHA=abcdef123' > .env
```

### Utilização
```bash
# Obtém todas as ofertas do campus Curitiba
$ yarn fetch --campus 'Curitiba'
Obtendo ofertas no campus Curitiba
Obtendo ofertas de Administração...
Obtendo ofertas de Arquitetura e Urbanismo...
Obtendo ofertas de Comunicação Institucional...
...
Ofertas salvas em ofertas.json

# Obtém ofertas apenas do curso especificado
$ yarn fetch --campus 'Curitiba' --curso 'Engenharia Eletrônica'
Obtendo ofertas de Engenharia Eletrônica no campus Curitiba
Ofertas salvas em ofertas.json
```

- Apesar de ser possível especificar um campus diferente de Curitiba,
os códigos de curso provavelmente diferem, quebrando a funcionalidade.
## O que pode melhorar?
- Adicionar compatibilidade para outros campi
- Obter detalhes para cada oferta
- Apresentação dos dados
- Diferentes formatos de saída
