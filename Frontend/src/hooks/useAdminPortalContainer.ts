import { useEffect, useState } from 'react'

export function useAdminPortalContainer() {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  
  useEffect(() => {
    // Tìm element có class .admin-theme
    const adminTheme = document.querySelector('.admin-theme') as HTMLElement
    setContainer(adminTheme || document.body)
  }, [])
  
  return container
}