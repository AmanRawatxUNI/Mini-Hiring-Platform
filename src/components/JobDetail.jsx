import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  PencilIcon,
  ArchiveBoxIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { useApi, api } from '../hooks/useApi.js'
import LoadingSpinner from './LoadingSpinner.jsx'

const JobDetail = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [assessments, setAssessments] = useState([])
  const { request, loading, error } = useApi()

  useEffect(() => {
    loadJobData()
  }, [jobId])

  const loadJobData = async () => {
    try {
      // Load job details
      const jobs = await request(api.getJobs)
      const currentJob = jobs.find(j => j.id.toString() === jobId)
      
      if (!currentJob) {
        navigate('/jobs')
        return
      }
      
      setJob(currentJob)

      // Load candidates for this job
      const allCandidates = await request(api.getCandidates)
      const jobCandidates = allCandidates.filter(c => c.jobId.toString() === jobId)
      setCandidates(jobCandidates)

      // Load assessments for this job
      const jobAssessments = await request(() => api.getAssessments(parseInt(jobId)))
      setAssessments(jobAssessments)
    } catch (err) {
      console.error('Error loading job data:', err)
    }
  }

  const handleEdit = () => {
    navigate('/jobs', { state: { editJob: job } })
  }

  const handleToggleStatus = async () => {
    const newStatus = job.status === 'active' ? 'archived' : 'active'
    await request(() => api.updateJob(job.id, { status: newStatus }), {
      onSuccess: (updatedJob) => {
        setJob(updatedJob)
      }
    })
  }

  const candidatesByStage = candidates.reduce((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1
    return acc
  }, {})

  const stageColors = {
    'Applied': 'from-blue-500 to-blue-600',
    'Phone Screen': 'from-yellow-500 to-yellow-600',
    'Technical Interview': 'from-purple-500 to-purple-600',
    'Final Interview': 'from-orange-500 to-orange-600',
    'Offer': 'from-green-500 to-green-600',
    'Rejected': 'from-red-500 to-red-600'
  }

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job not found</h2>
        <Link to="/jobs" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          ← Back to Jobs
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 text-white"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="relative">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Jobs
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.status === 'active' 
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                    : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-white/90 mb-6">
                {job.company && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full mr-2"></div>
                    {job.company}
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {job.location}
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    {job.salary}
                  </div>
                )}
                {job.type && (
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {job.type}
                  </div>
                )}
              </div>

              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-6 lg:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleStatus}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {job.status === 'active' ? (
                  <>
                    <EyeSlashIcon className="h-4 w-4 mr-2" />
                    Archive
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 border border-blue-200/50 dark:border-blue-700/50"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Candidates</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{candidates.length}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 border border-green-200/50 dark:border-green-700/50"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Applications</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {candidates.filter(c => !['Rejected', 'Hired'].includes(c.stage)).length}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200/50 dark:border-purple-700/50"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Assessments</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{assessments.length}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 border border-orange-200/50 dark:border-orange-700/50"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Offers Made</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {candidatesByStage['Offer'] || 0}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Job Description</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {job.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {job.requirements && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Requirements</h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Candidate Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Candidate Pipeline</h3>
            <div className="space-y-4">
              {Object.entries(candidatesByStage).map(([stage, count]) => (
                <div key={stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stage}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / candidates.length) * 100}%` }}
                      transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${stageColors[stage] || 'from-gray-400 to-gray-500'} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/candidates"
              className="mt-6 w-full btn-primary text-center block"
            >
              View All Candidates
            </Link>
          </div>

          {/* Assessments */}
          {assessments.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Assessments</h3>
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {assessment.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {assessment.sections?.length || 0} sections • {' '}
                      {assessment.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0} questions
                    </p>
                  </div>
                ))}
              </div>

              <Link
                to="/assessments"
                className="mt-4 w-full btn-secondary text-center block"
              >
                Manage Assessments
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default JobDetail