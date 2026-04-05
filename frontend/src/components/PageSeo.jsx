import { useLayoutEffect } from 'react'
import {
  DEFAULT_META_DESCRIPTION,
  DEFAULT_PAGE_TITLE,
  SITE_ORIGIN,
} from '../seo.js'

const DEFAULT_CANONICAL = `${SITE_ORIGIN}/`

/**
 * Syncs document title, meta description, and canonical for the current route.
 * Restores index.html defaults on unmount (SPA navigation).
 */
export default function PageSeo({ title, description, canonical }) {
  useLayoutEffect(() => {
    document.title = title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
    const link = document.querySelector('link[rel="canonical"]')
    if (link && canonical) link.setAttribute('href', canonical)
    return () => {
      document.title = DEFAULT_PAGE_TITLE
      if (meta) meta.setAttribute('content', DEFAULT_META_DESCRIPTION)
      if (link) link.setAttribute('href', DEFAULT_CANONICAL)
    }
  }, [title, description, canonical])

  return null
}
