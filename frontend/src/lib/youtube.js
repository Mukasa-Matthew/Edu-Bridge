/**
 * Convert a YouTube watch / short / embed URL to an embeddable iframe src.
 * Returns null if the URL is not a recognised YouTube link.
 */
export function youtubeUrlToEmbedSrc(input) {
  if (!input || typeof input !== 'string') return null
  const raw = input.trim()
  if (!raw) return null

  try {
    const u = new URL(raw, 'https://www.youtube.com')
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return id ? embedFromId(id) : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.slice('/embed/'.length).split('/')[0]
        return id ? embedFromId(id) : null
      }
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.slice('/shorts/'.length).split('/')[0]
        return id ? embedFromId(id) : null
      }
      const v = u.searchParams.get('v')
      if (v) return embedFromId(v)
    }
  } catch {
    return null
  }
  return null
}

function embedFromId(id) {
  const clean = String(id).replace(/[^0-9A-Za-z_-]/g, '')
  if (clean.length < 10 || clean.length > 12) return null
  return `https://www.youtube-nocookie.com/embed/${clean}?rel=0&modestbranding=1`
}
