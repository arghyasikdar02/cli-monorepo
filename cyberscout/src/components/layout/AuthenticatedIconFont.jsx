import { useEffect } from 'react'

const ICON_FONT_ID = 'cli-authenticated-icon-font'

export default function AuthenticatedIconFont() {
  useEffect(() => {
    if (document.getElementById(ICON_FONT_ID)) return undefined

    const stylesheet = document.createElement('link')
    stylesheet.id = ICON_FONT_ID
    stylesheet.rel = 'stylesheet'
    stylesheet.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
    document.head.appendChild(stylesheet)
    return undefined
  }, [])

  return null
}
