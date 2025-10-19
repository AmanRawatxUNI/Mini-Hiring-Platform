import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  SunIcon, 
  MoonIcon,
  BellIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline'

const Header = ({ onMenuClick, theme, onThemeToggle }) => {
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notificationsRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = [
    { id: 1, text: 'New candidate applied for Senior Frontend Developer', time: '5m ago', type: 'candidate', link: '/candidates' },
    { id: 2, text: 'Interview scheduled with John Doe', time: '1h ago', type: 'interview', link: '/candidates/1' },
    { id: 3, text: 'Assessment completed by Jane Smith', time: '2h ago', type: 'assessment', link: '/assessments' },
    { id: 4, text: 'New job posted: Backend Engineer', time: '3h ago', type: 'job', link: '/jobs' },
    { id: 5, text: 'Candidate moved to Final Interview stage', time: '4h ago', type: 'candidate', link: '/candidates' }
  ]

  const handleNotificationClick = async (notification) => {
    if (notification.type === 'interview') {
      // Extract name from notification text
      const match = notification.text.match(/with (.+)$/)
      if (match) {
        const candidateName = match[1]
        try {
          const candidates = await api.getCandidates()
          const candidate = candidates.find(c => c.name.toLowerCase().includes(candidateName.toLowerCase()))
          if (candidate) {
            navigate(`/candidates/${candidate.id}`)
            setShowNotifications(false)
            return
          }
        } catch (error) {
          console.error('Error finding candidate:', error)
        }
      }
    }
    navigate(notification.link)
    setShowNotifications(false)
  }
  return (
    <header className="sticky top-0 z-[9998] bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-[0_8px_40px_rgba(139,92,246,0.2)] border-b-2 border-violet-300/60 dark:border-indigo-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onMenuClick}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="lg:hidden ml-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                TALENTFLOW
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              onClick={onThemeToggle}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfile(false)
                }}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleNotificationClick(notif)}
                          className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <p className="text-sm text-gray-900 dark:text-gray-100">{notif.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowProfile(!showProfile)
                  setShowNotifications(false)
                }}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserCircleIcon className="h-6 w-6" />
              </motion.button>
              
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">HR Manager</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">hr@entnt.com</p>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { navigate('/profile-settings'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Profile Settings</button>
                      <button onClick={() => alert('Preferences - Coming Soon!')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Preferences</button>
                      <button onClick={() => { if(confirm('Are you sure you want to sign out?')) alert('Sign Out - Coming Soon!') }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Sign Out</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header