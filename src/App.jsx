import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { seedDatabase } from './data/seedData.js'
import { useTheme } from './hooks/useTheme.js'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import JobsPage from './components/JobsPage.jsx'
import JobDetail from './components/JobDetail.jsx'
import CandidatesPage from './components/CandidatesPage.jsx'
import CandidateProfile from './components/CandidateProfile.jsx'
import AssessmentsPage from './components/AssessmentsPage.jsx'
import AnalyticsPage from './components/AnalyticsPage.jsx'
import ProfileSettings from './components/ProfileSettings.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    // Initialize database and seed data
    const initializeApp = async () => {
      try {
        await seedDatabase()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              TALENTFLOW
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Initializing your hiring platform...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden" style={{ willChange: 'transform' }}>
        <div className="absolute inset-0 bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900"></div>
        <div className="absolute top-0 right-0 w-[700px] h-[700px] dark:bg-gradient-to-br dark:from-violet-400/40 dark:via-purple-400/40 dark:to-fuchsia-400/40 rounded-full blur-3xl transform-gpu"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] dark:bg-gradient-to-tr dark:from-cyan-400/40 dark:via-blue-400/40 dark:to-indigo-400/40 rounded-full blur-3xl transform-gpu"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] dark:bg-gradient-to-br dark:from-pink-400/30 dark:via-rose-400/30 dark:to-orange-400/30 rounded-full blur-3xl transform-gpu"></div>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="lg:pl-64 relative z-10">
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            theme={theme}
            onThemeToggle={toggleTheme}
          />
          
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Navigate to="/jobs" replace />} />
                  <Route 
                    path="/jobs" 
                    element={
                      <motion.div
                        key="jobs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0 }}
                      >
                        <JobsPage />
                      </motion.div>
                    } 
                  />
                  <Route 
                    path="/jobs/:jobId" 
                    element={
                      <motion.div
                        key="job-detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0 }}
                      >
                        <JobDetail />
                      </motion.div>
                    } 
                  />
                  <Route 
                    path="/candidates" 
                    element={
                      <motion.div
                        key="candidates"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0 }}
                      >
                        <CandidatesPage />
                      </motion.div>
                    } 
                  />
                  <Route 
                    path="/candidates/:candidateId" 
                    element={
                      <motion.div
                        key="candidate-profile"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0 }}
                      >
                        <CandidateProfile />
                      </motion.div>
                    } 
                  />
                  <Route 
                    path="/assessments" 
                    element={
                      <motion.div
                        key="assessments"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0 }}
                      >
                        <AssessmentsPage />
                      </motion.div>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <motion.div
                        key="analytics"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0 }}
                      >
                        <AnalyticsPage />
                      </motion.div>
                    } 
                  />
                  <Route 
                    path="/profile-settings" 
                    element={
                      <motion.div
                        key="profile-settings"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0 }}
                      >
                        <ProfileSettings />
                      </motion.div>
                    } 
                  />
                </Routes>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App