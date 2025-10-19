import { useState, useEffect } from 'react'
import { dbOperations } from '../store/database.js'

// Custom hook for theme management with persistence
export function useTheme() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Load theme from database
    const loadTheme = async () => {
      try {
        const savedTheme = await dbOperations.getSetting('theme')
        if (savedTheme) {
          setTheme(savedTheme)
          applyTheme(savedTheme)
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          const systemTheme = prefersDark ? 'dark' : 'light'
          setTheme(systemTheme)
          applyTheme(systemTheme)
        }
      } catch (error) {
        console.error('Error loading theme:', error)
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