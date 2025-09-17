import { useEffect, useState } from 'react'
import { fetchI18n, saveTranslation, I18nState } from './api'

export function App() {
  const [data, setData] = useState<I18nState | null>(null)
  const [edits, setEdits] = useState<Record<string,string>>({})

  useEffect(() => { load() }, [])
  async function load() {
    setData(await fetchI18n())
    setEdits({})
  }

  if (!data) return <p>Carregando…</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>I18N Debt Dashboard</h1>
      {(['en','ptBR'] as const).map(lang => (
        <section key={lang}>
          <h2>{lang === 'en' ? 'English' : 'Português'}</h2>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th>Key</th><th>Value</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.missing[lang].map(key => (
                <tr key={key}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{key}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <input
                      style={{ width: '100%' }}
                      value={edits[`${lang}|${key}`] || ''}
                      onChange={e =>
                        setEdits({ ...edits, [`${lang}|${key}`]: e.target.value })
                      }
                    />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <button
                      onClick={async () => {
                        const v = edits[`${lang}|${key}`] || ''
                        await saveTranslation(lang, key, v)
                        load()
                      }}
                    >
                      Salvar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}

