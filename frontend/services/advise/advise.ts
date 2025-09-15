/** Front helper: manda scorecard.json + hotspots pro GW e recebe JSON (texto) */
export async function advise(mode: 'exec' | 'code' | 'ops' | 'community', payload: {
  provider: string, model: string,
  scorecard: any, hotspots?: string[], temperature?: number,
  externalApiKey?: string, tenantId?: string, userId?: string
}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (payload.externalApiKey) headers['x-external-api-key'] = payload.externalApiKey
  if (payload.tenantId) headers['x-tenant-id'] = payload.tenantId
  if (payload.userId) headers['x-user-id'] = payload.userId

  const res = await fetch(`/v1/advise?mode=${mode}`, {
    method: 'POST', headers,
    body: JSON.stringify({
      provider: payload.provider, model: payload.model,
      scorecard: payload.scorecard, hotspots: payload.hotspots ?? [],
      temperature: payload.temperature ?? 0.1,
    })
  })
  if (!res.ok || !res.body) throw new Error(`advise HTTP ${res.status}`)
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = '', acc = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let i
    while ((i = buf.indexOf('nn')) >= 0) {
      const ev = buf.slice(0, i); buf = buf.slice(i + 2)
      for (const line of ev.split('n')) {
        const t = line.trim()
        if (!t.startsWith('data:')) continue
        const data = t.slice(5).trim()
        if (!data || data === '[DONE]') continue
        try {
          const obj = JSON.parse(data)
          if (obj.content) acc += String(obj.content)
        } catch { }
      }
    }
  }
  // tenta parsear JSON final
  try { return JSON.parse(acc) } catch { return acc }
}
