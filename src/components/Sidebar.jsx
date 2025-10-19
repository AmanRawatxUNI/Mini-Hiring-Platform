import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  BriefcaseIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Candidates', href: '/candidates', icon: UsersIcon },
  { name: 'Assessments', href: '/assessments', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
]

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const sidebarContent = (
    <div className="flex h-full flex-col bg-gradient-to-b from-white via-violet-100/60 to-fuchsia-100/40 dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900 shadow-lg border-r-2 border-violet-300/70 dark:border-indigo-900/50 transform-gpu">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.7)] hover:shadow-[0_0_50px_rgba(139,92,246,0.9)] transition-all duration-150 hover:scale-110">
              <span className="text-white font-bold text-lg">TF</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              TALENTFLOW
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mini Hiring Platform
            </p>
          </div>
        </div>
        
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>© 2025 TALENTFLOW</p>
          <p className="mt-1">Mini Hiring Platform</p>
          <p className="mt-1">
            by <a href="https://linkedin.com/in/amanrawat2004" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">Aman Rawat</a>
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-gray-900/80 lg:hidden"
              onClick={onClose}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar