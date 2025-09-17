import express from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import chokidar from 'chokidar'
import execa from 'execa'
import cors from 'cors'

const port = 3000
const srcDir = path.resolve('./frontend')
const localesDir = path.resolve('./frontend/locales')
let state = { used: [], en: [], ptBR: [], missing: {}, unused: {} }

async function scanUsedKeys() {
  const { stdout } = await execa('rg', [
    '-no','--pcre2',
    "t\\(\\s*['\"\\$(]([A-Za-z][\\w-]+)\\.([A-Za-z0-9_.-]+)['\")]",
    srcDir
  ])
  state.used = Array.from(new Set(stdout.split('\n').filter(Boolean)))
}

async function scanAvail(lang, outKey) {
  const set = new Set()
  const dir = path.join(localesDir, lang)
  for (const f of await fs.readdir(dir)) {
    if (!f.endsWith('.ts')) continue
    const ns = path.basename(f, '.ts')
    const txt = await fs.readFile(path.join(dir, f), 'utf8')
    txt.match(/'([^']+)':/g)?.forEach(m => set.add(`${ns}.${m.slice(1,-2)}`))
  }
  state[outKey] = Array.from(set)
}

function computeDebt() {
  ['en','ptBR'].forEach(lang => {
    const avail = state[lang]
    state.missing[lang] = state.used.filter(k => !avail.includes(k))
    state.unused[lang]  = avail.filter(k => !state.used.includes(k))
  })
}

async function refreshAll() {
  await scanUsedKeys()
  await scanAvail('en-US','en')
  await scanAvail('pt-BR','ptBR')
  computeDebt()
}

chokidar.watch([srcDir, `${localesDir}/**/*.ts`]).on('all', refreshAll)
refreshAll()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname,'../client/dist')))

app.get('/api/keys', (_, res) => res.json(state))

app.post('/api/translate', async (req, res) => {
  const { lang, key, value } = req.body
  const [ns, ...rest] = key.split('.')
  const file = path.join(
    localesDir,
    lang === 'en' ? 'en-US' : 'pt-BR',
    ns + '.ts'
  )
  let c = await fs.readFile(file,'utf8')
  c = c.replace(/export default\s*{/, m =>
    `${m}\n  '${rest.join('.')}': '${value}',`
  )
  await fs.writeFile(file, c, 'utf8')
  await refreshAll()
  res.sendStatus(204)
})

app.listen(port, ()=>console.log(`🚀 Server running on http://localhost:${port}`))

