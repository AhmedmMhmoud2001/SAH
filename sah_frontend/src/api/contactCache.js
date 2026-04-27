import { getPublicContactInfo } from './index.js'

let cached = null
let inflight = null

export async function getContactInfoCached() {
  if (cached) return cached
  if (inflight) return await inflight
  inflight = (async () => {
    try {
      const data = await getPublicContactInfo()
      cached = data || {}
      return cached
    } finally {
      inflight = null
    }
  })()
  return await inflight
}

