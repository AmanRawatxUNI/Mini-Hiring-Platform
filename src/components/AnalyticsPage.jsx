import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChartBarIcon, UsersIcon, BriefcaseIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useApi, api } from '../hooks/useApi.js'
import LoadingSpinner from './LoadingSpinner.jsx'

const AnalyticsPage = () => {
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const { request, loading } = useApi()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await Promise.all([
      request(api.getJobs, { onSuccess: setJobs }),
      request(api.getCandidates, { onSuccess: setCandidates })
    ])
  }

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalCandidates: candidates.length,
    byStage: {
      'Applied': candidates.filter(c => c.stage === 'Applied').length,
      'Phone Screen': candidates.filter(c => c.stage === 'Phone Screen').length,
      'Technical Interview': candidates.filter(c => c.stage === 'Technical Interview').length,
      'Final Interview': candidates.filter(c => c.stage === 'Final Interview').length,
      'Offer': candidates.filter(c => c.stage === 'Offer').length,
      'Rejected': candidates.filter(c => c.stage === 'Rejected').length
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of hiring metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BriefcaseIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalJobs}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeJobs}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCandidates}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Offers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.byStage['Offer']}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Candidates by Stage</h3>
        <div className="space-y-4">
          {Object.entries(stats.byStage).map(([stage, count], index) => (
            <motion.div key={stage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stage}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{count} candidates</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full" style={{ width: `${(count / stats.totalCandidates) * 100}%` }}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
