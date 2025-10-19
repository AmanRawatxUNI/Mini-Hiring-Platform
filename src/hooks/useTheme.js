import { useState, useEffect } from 'react'
import { dbOperations } from '../store/database.js'

// Custom hook for theme management with persistence
export function useTheme() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Apply dark mode immediately
    applyTheme('dark')
    
    // Load theme from database
    const loadTheme = async () => {
      try {
        const savedTheme = await dbOperations.getSetting('theme')
        if (savedTheme) {
          setTheme(savedTheme)
          applyTheme(savedTheme)
        } else {
          // Default to dark mode
          setTheme('dark')
          applyTheme('dark')
          await dbOperations.setSetting('theme', 'dark')
        }
      } catch (error) {
        console.error('Error loading theme:', error)
        setTheme('dark')
        applyTheme('dark')
      }
    }

    loadTheme()
  }, [])

  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
    
    try {
      await dbOperations.setSetting('theme', newTheme)
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  }

  return { theme, toggleTheme }
}