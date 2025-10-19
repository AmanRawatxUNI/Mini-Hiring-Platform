import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { useApi, api } from '../hooks/useApi.js'
import { validateForm, validators, generateSlug } from '../utils/validation.js'
import LoadingSpinner from './LoadingSpinner.jsx'
import Modal from './Modal.jsx'
import { Menu } from '@headlessui/react'

const JobsPage = () => {
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    company: '',
    salary: '',
    type: 'Full-time',
    tags: []
  })
  const [formErrors, setFormErrors] = useState({})
  
  const { request, loading, error } = useApi()
  const jobsPerPage = 10

  // Load jobs on component mount
  useEffect(() => {
    loadJobs()
  }, [])

  // Filter jobs when search or filter changes
  useEffect(() => {
    let filtered = jobs

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    setFilteredJobs(filtered)
    setCurrentPage(1)
  }, [jobs, searchQuery, statusFilter])

  const loadJobs = async () => {
    await request(api.getJobs, {
      onSuccess: (data) => {
        setJobs(data)
      }
    })
  }

  const handleCreateJob = () => {
    setEditingJob(null)
    setFormData({
      title: '',
      description: '',
      requirements: '',
      location: '',
      company: '',
      salary: '',
      type: 'Full-time',
      tags: []
    })
    setFormErrors({})
    setIsCreateModalOpen(true)
  }

  const handleEditJob = (job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      company: job.company || '',
      salary: job.salary || '',
      type: job.type || 'Full-time',
      tags: job.tags || []
    })
    setFormErrors({})
    setIsCreateModalOpen(true)
  }

  const handleSubmitJob = async (e) => {
    e.preventDefault()

    // Validate form
    const existingSlugs = jobs
      .filter(job => job.id !== editingJob?.id)
      .map(job => job.slug)

    const schema = {
      title: [validators.required],
      slug: [validators.unique(existingSlugs, editingJob?.slug)]
    }

    const slug = generateSlug(formData.title)
    const validation = validateForm({ ...formData, slug }, schema)

    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    const jobData = {
      ...formData,
      slug,
      status: editingJob?.status || 'active'
    }

    if (editingJob) {
      // Update existing job
      await request(() => api.updateJob(editingJob.id, jobData), {
        onSuccess: (updatedJob) => {
          setJobs(jobs.map(job => job.id === editingJob.id ? updatedJob : job))
          setIsCreateModalOpen(false)
        },
        optimisticUpdate: () => {
          setJobs(jobs.map(job => job.id === editingJob.id ? { ...job, ...jobData } : job))
        },
        rollback: () => {
          setJobs(jobs.map(job => job.id === editingJob.id ? editingJob : job))
        }
      })
    } else {
      // Create new job
      await request(() => api.createJob(jobData), {
        onSuccess: (newJob) => {
          setJobs([...jobs, newJob])
          setIsCreateModalOpen(false)
        }
      })
    }
  }

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'archived' : 'active'
    
    await request(() => api.updateJob(job.id, { status: newStatus }), {
      onSuccess: (updatedJob) => {
        setJobs(jobs.map(j => j.id === job.id ? updatedJob : j))
      },
      optimisticUpdate: () => {
        setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j))
      },
      rollback: () => {
        setJobs(jobs.map(j => j.id === job.id ? job : j))
      }
    })
  }

  const handleDeleteJob = async (job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"?`)) return

    await request(() => api.deleteJob(job.id), {
      onSuccess: () => {
        setJobs(jobs.filter(j => j.id !== job.id))
      },
      optimisticUpdate: () => {
        setJobs(jobs.filter(j => j.id !== job.id))
      },
      rollback: () => {
        setJobs([...jobs, job])
      }
    })
  }

  const handleDragEnd = useCallback(async (result) => {
    if (!result.destination) return

    const reorderedJobs = Array.from(jobs)
    const [removed] = reorderedJobs.splice(result.source.index, 1)
    reorderedJobs.splice(result.destination.index, 0, removed)

    setJobs(reorderedJobs)

    await request(() => api.reorderJobs(reorderedJobs), {
      onError: () => {
        loadJobs()
      }
    })
  }, [jobs, request])

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      const newTag = e.target.value.trim()
      if (!formData.tags.includes(newTag)) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] })
      }
      e.target.value = ''
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage job postings and track applications
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateJob}
          className="btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Job
        </motion.button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative sm:w-48">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 pl-10 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="card">
        {loading && jobs.length === 0 ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="jobs">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <AnimatePresence>
                    {paginatedJobs.map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.1 }}
                            className={`p-6 border-b-2 border-violet-200 dark:border-indigo-900/30 last:border-b-0 hover:bg-gradient-to-r hover:from-violet-100/70 hover:to-fuchsia-100/70 dark:hover:from-indigo-950/30 dark:hover:to-purple-950/30 transition-all duration-150 rounded-2xl mx-2 my-2 shadow-lg shadow-violet-200/50 hover:shadow-[0_12px_40px_rgba(139,92,246,0.3)] ${
                              snapshot.isDragging ? 'bg-gray-100 dark:bg-gray-700 shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                  <Link 
                                    to={`/jobs/${job.id}`}
                                    className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  >
                                    {job.title}
                                  </Link>
                                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold shadow-xl ${
                                    job.status === 'active'
                                      ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-emerald-500/60'
                                      : 'bg-gradient-to-r from-slate-400 via-gray-400 to-zinc-400 text-white shadow-gray-500/60'
                                  }`}>
                                    {job.status}
                                  </span>
                                </div>
                                
                                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  {job.company && <span>{job.company}</span>}
                                  {job.location && <span>• {job.location}</span>}
                                  {job.type && <span>• {job.type}</span>}
                                </div>
                                
                                {job.tags && job.tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {job.tags.map((tag, idx) => (
                                      <span
                                        key={tag}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-xl hover:scale-110 transition-all duration-150 ${
                                          idx % 3 === 0 ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-violet-500/50 hover:shadow-violet-500/70' :
                                          idx % 3 === 1 ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-fuchsia-500/50 hover:shadow-fuchsia-500/70' :
                                          'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/50 hover:shadow-cyan-500/70'
                                        }`}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Actions Menu */}
                              <Menu as="div" className="relative ml-4">
                                <Menu.Button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <EllipsisVerticalIcon className="h-5 w-5" />
                                </Menu.Button>
                                
                                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleEditJob(job)}
                                        className={`${
                                          active ? 'bg-gray-50 dark:bg-gray-700' : ''
                                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                      >
                                        <PencilIcon className="h-4 w-4 mr-3" />
                                        Edit
                                      </button>
                                    )}
                                  </Menu.Item>
                                  
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleToggleStatus(job)}
                                        className={`${
                                          active ? 'bg-gray-50 dark:bg-gray-700' : ''
                                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                      >
                                        {job.status === 'active' ? (
                                          <>
                                            <EyeSlashIcon className="h-4 w-4 mr-3" />
                                            Archive
                                          </>
                                        ) : (
                                          <>
                                            <EyeIcon className="h-4 w-4 mr-3" />
                                            Activate
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </Menu.Item>
                                  
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleDeleteJob(job)}
                                        className={`${
                                          active ? 'bg-red-50 dark:bg-red-900/20' : ''
                                        } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                      >
                                        <TrashIcon className="h-4 w-4 mr-3" />
                                        Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </Menu.Items>
                              </Menu>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(startIndex + jobsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Job Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingJob ? 'Edit Job' : 'Create New Job'}
      >
        <form onSubmit={handleSubmitJob} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`input ${formErrors.title ? 'border-red-500' : ''}`}
              placeholder="e.g. Senior Frontend Developer"
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input"
              placeholder="Job description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input"
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="e.g. San Francisco, Remote"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="input"
                placeholder="e.g. $80,000 - $120,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={2}
              className="input"
              placeholder="Required skills and experience..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <input
              type="text"
              onKeyDown={handleTagInput}
              className="input"
              placeholder="Press Enter to add tags..."
            />
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner size="sm" /> : (editingJob ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

export default JobsPage