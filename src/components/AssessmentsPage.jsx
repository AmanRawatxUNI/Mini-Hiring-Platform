import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { useApi, api } from '../hooks/useApi.js'
import { validateAssessmentResponse } from '../utils/validation.js'
import LoadingSpinner from './LoadingSpinner.jsx'
import Modal from './Modal.jsx'

const questionTypes = [
  { value: 'single-choice', label: 'Single Choice', icon: '◉' },
  { value: 'multi-choice', label: 'Multiple Choice', icon: '☑' },
  { value: 'text-short', label: 'Short Text', icon: '📝' },
  { value: 'text-long', label: 'Long Text', icon: '📄' },
  { value: 'numeric', label: 'Numeric', icon: '#' },
  { value: 'file-upload', label: 'File Upload', icon: '📎' }
]

const AssessmentsPage = () => {
  const [jobs, setJobs] = useState([])
  const [assessments, setAssessments] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewAssessment, setPreviewAssessment] = useState(null)
  const [previewResponses, setPreviewResponses] = useState({})
  const [previewErrors, setPreviewErrors] = useState({})
  
  // Builder state
  const [builderData, setBuilderData] = useState({
    title: '',
    description: '',
    sections: []
  })
  
  const { request, loading, error } = useApi()

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    if (selectedJobId) {
      loadAssessments(selectedJobId)
    }
  }, [selectedJobId])

  const loadJobs = async () => {
    await request(api.getJobs, {
      onSuccess: (data) => {
        setJobs(data.filter(job => job.status === 'active'))
        if (data.length > 0 && !selectedJobId) {
          setSelectedJobId(data[0].id.toString())
        }
      }
    })
  }

  const loadAssessments = async (jobId) => {
    if (!jobId) {
      setAssessments([])
      return
    }
    await request(() => api.getAssessments(parseInt(jobId)), {
      onSuccess: (data) => {
        setAssessments(data || [])
        if (data.length === 0) {
          console.log('No assessments found for this job. Click Re-seed Data on Candidates page to generate demo assessments.')
        }
      }
    })
  }

  const handleCreateAssessment = () => {
    setEditingAssessment(null)
    setBuilderData({
      title: '',
      description: '',
      sections: [{
        id: uuidv4(),
        title: 'Section 1',
        description: '',
        questions: []
      }]
    })
    setIsBuilderOpen(true)
  }

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment)
    setBuilderData({
      title: assessment.title,
      description: assessment.description || '',
      sections: assessment.sections || []
    })
    setIsBuilderOpen(true)
  }

  const handleSaveAssessment = async () => {
    if (!builderData.title.trim()) return

    const assessmentData = {
      ...builderData,
      jobId: parseInt(selectedJobId)
    }

    if (editingAssessment) {
      await request(() => api.updateAssessment(editingAssessment.id, assessmentData), {
        onSuccess: (updated) => {
          setAssessments(assessments.map(a => a.id === editingAssessment.id ? updated : a))
          setIsBuilderOpen(false)
        }
      })
    } else {
      await request(() => api.createAssessment(assessmentData), {
        onSuccess: (newAssessment) => {
          setAssessments([...assessments, newAssessment])
          setIsBuilderOpen(false)
        }
      })
    }
  }

  const handlePreviewAssessment = (assessment) => {
    setPreviewAssessment(assessment)
    setPreviewResponses({})
    setPreviewErrors({})
    setIsPreviewOpen(true)
  }

  const handlePreviewSubmit = async () => {
    const errors = {}
    
    // Validate all responses
    previewAssessment.sections.forEach(section => {
      section.questions.forEach(question => {
        const response = previewResponses[question.id]
        const questionErrors = validateAssessmentResponse(response, question)
        if (questionErrors.length > 0) {
          errors[question.id] = questionErrors[0]
        }
      })
    })

    setPreviewErrors(errors)

    if (Object.keys(errors).length === 0) {
      // Save response
      const responseData = {
        candidateId: 1, // Mock candidate ID
        assessmentId: previewAssessment.id,
        answers: previewResponses
      }

      await request(() => api.saveResponse(responseData), {
        onSuccess: () => {
          alert('Assessment submitted successfully!')
          setIsPreviewOpen(false)
        }
      })
    }
  }

  // Builder functions
  const addSection = () => {
    setBuilderData({
      ...builderData,
      sections: [...builderData.sections, {
        id: uuidv4(),
        title: `Section ${builderData.sections.length + 1}`,
        description: '',
        questions: []
      }]
    })
  }

  const updateSection = (sectionId, updates) => {
    setBuilderData({
      ...builderData,
      sections: builderData.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    })
  }

  const deleteSection = (sectionId) => {
    setBuilderData({
      ...builderData,
      sections: builderData.sections.filter(section => section.id !== sectionId)
    })
  }

  const addQuestion = (sectionId) => {
    const newQuestion = {
      id: uuidv4(),
      type: 'text-short',
      question: '',
      required: false,
      options: []
    }

    setBuilderData({
      ...builderData,
      sections: builderData.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    })
  }

  const updateQuestion = (sectionId, questionId, updates) => {
    setBuilderData({
      ...builderData,
      sections: builderData.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(question =>
                question.id === questionId ? { ...question, ...updates } : question
              )
            }
          : section
      )
    })
  }

  const deleteQuestion = (sectionId, questionId) => {
    setBuilderData({
      ...builderData,
      sections: builderData.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      )
    })
  }

  const addOption = (sectionId, questionId) => {
    updateQuestion(sectionId, questionId, {
      options: [...(builderData.sections
        .find(s => s.id === sectionId)?.questions
        .find(q => q.id === questionId)?.options || []), '']
    })
  }

  const updateOption = (sectionId, questionId, optionIndex, value) => {
    const question = builderData.sections
      .find(s => s.id === sectionId)?.questions
      .find(q => q.id === questionId)
    
    if (question) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      updateQuestion(sectionId, questionId, { options: newOptions })
    }
  }

  const removeOption = (sectionId, questionId, optionIndex) => {
    const question = builderData.sections
      .find(s => s.id === sectionId)?.questions
      .find(q => q.id === questionId)
    
    if (question) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex)
      updateQuestion(sectionId, questionId, { options: newOptions })
    }
  }

  // Preview response handlers
  const handlePreviewResponse = (questionId, value) => {
    setPreviewResponses({ ...previewResponses, [questionId]: value })
    // Clear error when user starts typing
    if (previewErrors[questionId]) {
      setPreviewErrors({ ...previewErrors, [questionId]: null })
    }
  }

  const shouldShowQuestion = (question) => {
    if (!question.conditional || !question.showIf?.questionId) return true
    
    const dependentResponse = previewResponses[question.showIf.questionId]
    const expectedAnswer = question.showIf.answer
    
    if (Array.isArray(dependentResponse)) {
      return dependentResponse.includes(expectedAnswer)
    }
    
    return String(dependentResponse).toLowerCase() === String(expectedAnswer).toLowerCase()
  }

  const renderPreviewQuestion = (question) => {
    if (!shouldShowQuestion(question)) return null
    
    const response = previewResponses[question.id]
    const error = previewErrors[question.id]

    return (
      <div key={question.id} className="space-y-3">
        <div className="flex items-start justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {question.question}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>

        {question.type === 'single-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={response === option}
                  onChange={(e) => handlePreviewResponse(question.id, e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'multi-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(response) && response.includes(option)}
                  onChange={(e) => {
                    const currentResponse = Array.isArray(response) ? response : []
                    const newResponse = e.target.checked
                      ? [...currentResponse, option]
                      : currentResponse.filter(item => item !== option)
                    handlePreviewResponse(question.id, newResponse)
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'text-short' && (
          <input
            type="text"
            value={response || ''}
            onChange={(e) => handlePreviewResponse(question.id, e.target.value)}
            maxLength={question.maxLength}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder="Your answer..."
          />
        )}

        {question.type === 'text-long' && (
          <textarea
            value={response || ''}
            onChange={(e) => handlePreviewResponse(question.id, e.target.value)}
            maxLength={question.maxLength}
            rows={4}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder="Your answer..."
          />
        )}

        {question.type === 'numeric' && (
          <input
            type="number"
            value={response || ''}
            onChange={(e) => handlePreviewResponse(question.id, e.target.value)}
            min={question.min}
            max={question.max}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder="Enter a number..."
          />
        )}

        {question.type === 'file-upload' && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <label className="cursor-pointer">
                <span className="text-sm text-primary-600 hover:text-primary-500">
                  Click to upload
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept={question.acceptedTypes?.join(',')}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handlePreviewResponse(question.id, file.name)
                    }
                  }}
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {question.acceptedTypes?.join(', ') || 'Any file type'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {question.maxLength && (question.type === 'text-short' || question.type === 'text-long') && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(response?.length || 0)} / {question.maxLength} characters
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Assessments
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage candidate assessments
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={async () => {
              if (confirm('Generate demo assessments for all jobs?')) {
                const { seedDatabase } = await import('../data/seedData.js')
                await seedDatabase(true)
                loadJobs()
                if (selectedJobId) loadAssessments(selectedJobId)
              }
            }}
            className="px-3 py-2 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Generate Demo
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateAssessment}
            disabled={!selectedJobId}
            className="btn-primary disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Assessment
          </motion.button>
        </div>
      </div>

      {/* Job Selection */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Job:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">Choose a job...</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessments List */}
      {selectedJobId && (
        <div className="card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Assessments for {jobs.find(j => j.id.toString() === selectedJobId)?.title}
            </h3>
          </div>

          {loading ? (
            <div className="p-8">
              <LoadingSpinner />
            </div>
          ) : assessments.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {assessments.map((assessment) => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {assessment.title}
                      </h4>
                      {assessment.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {assessment.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{assessment.sections?.length || 0} sections</span>
                        <span>
                          {assessment.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0} questions
                        </span>
                        <span>
                          Created {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : 'recently'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePreviewAssessment(assessment)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditAssessment(assessment)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <DocumentTextIcon className="mx-auto h-12 w-12 mb-4" />
              <p>No assessments created yet</p>
              <p className="text-sm mt-1">Create your first assessment to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Assessment Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title={editingAssessment ? 'Edit Assessment' : 'Create Assessment'}
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Builder Panel */}
          <div className="space-y-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assessment Title
                </label>
                <input
                  type="text"
                  value={builderData.title}
                  onChange={(e) => setBuilderData({ ...builderData, title: e.target.value })}
                  className="input"
                  placeholder="Assessment title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={builderData.description}
                  onChange={(e) => setBuilderData({ ...builderData, description: e.target.value })}
                  rows={2}
                  className="input"
                  placeholder="Assessment description..."
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Sections</h4>
                <button
                  onClick={addSection}
                  className="btn-primary text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Section
                </button>
              </div>

              {builderData.sections.map((section, sectionIndex) => (
                <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="font-medium bg-transparent border-none p-0 text-gray-900 dark:text-gray-100 focus:ring-0"
                      placeholder="Section title..."
                    />
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    rows={1}
                    className="w-full text-sm bg-transparent border-none p-0 text-gray-600 dark:text-gray-400 focus:ring-0 resize-none"
                    placeholder="Section description..."
                  />

                  {/* Questions */}
                  <div className="mt-4 space-y-3">
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => updateQuestion(section.id, question.id, { question: e.target.value })}
                              className="w-full text-sm bg-transparent border-none p-0 text-gray-900 dark:text-gray-100 focus:ring-0"
                              placeholder="Question text..."
                            />
                            
                            <div className="flex items-center space-x-4">
                              <select
                                value={question.type}
                                onChange={(e) => updateQuestion(section.id, question.id, { type: e.target.value, options: ['single-choice', 'multi-choice'].includes(e.target.value) ? [''] : [] })}
                                className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                              >
                                {questionTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                  </option>
                                ))}
                              </select>
                              
                              <label className="flex items-center text-xs">
                                <input
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) => updateQuestion(section.id, question.id, { required: e.target.checked })}
                                  className="mr-1"
                                />
                                Required
                              </label>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => deleteQuestion(section.id, question.id)}
                            className="text-red-500 hover:text-red-700 p-1 ml-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Question-specific options */}
                        {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(section.id, question.id, optionIndex, e.target.value)}
                                  className="flex-1 text-xs input"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <button
                                  onClick={() => removeOption(section.id, question.id, optionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(section.id, question.id)}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}

                        {(question.type === 'text-short' || question.type === 'text-long') && (
                          <div className="mt-2">
                            <input
                              type="number"
                              value={question.maxLength || ''}
                              onChange={(e) => updateQuestion(section.id, question.id, { maxLength: parseInt(e.target.value) || undefined })}
                              className="text-xs input w-24"
                              placeholder="Max length"
                            />
                          </div>
                        )}

                        {question.type === 'numeric' && (
                          <div className="mt-2 flex space-x-2">
                            <input
                              type="number"
                              value={question.min || ''}
                              onChange={(e) => updateQuestion(section.id, question.id, { min: parseFloat(e.target.value) || undefined })}
                              className="text-xs input w-20"
                              placeholder="Min"
                            />
                            <input
                              type="number"
                              value={question.max || ''}
                              onChange={(e) => updateQuestion(section.id, question.id, { max: parseFloat(e.target.value) || undefined })}
                              className="text-xs input w-20"
                              placeholder="Max"
                            />
                          </div>
                        )}

                        <div className="mt-3 p-2 bg-violet-50 dark:bg-gray-600 rounded text-xs">
                          <label className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={question.conditional || false}
                              onChange={(e) => updateQuestion(section.id, question.id, { 
                                conditional: e.target.checked,
                                showIf: e.target.checked ? { questionId: '', answer: '' } : undefined
                              })}
                              className="mr-2"
                            />
                            <span className="font-semibold">Show conditionally</span>
                          </label>
                          
                          {question.conditional && (
                            <div className="space-y-2 ml-5">
                              <select
                                value={question.showIf?.questionId || ''}
                                onChange={(e) => updateQuestion(section.id, question.id, {
                                  showIf: { ...question.showIf, questionId: e.target.value }
                                })}
                                className="text-xs input w-full"
                              >
                                <option value="">Select question...</option>
                                {builderData.sections.flatMap(s => 
                                  s.questions.filter(q => q.id !== question.id).map(q => (
                                    <option key={q.id} value={q.id}>{q.question || 'Untitled'}</option>
                                  ))
                                )}
                              </select>
                              
                              <input
                                type="text"
                                value={question.showIf?.answer || ''}
                                onChange={(e) => updateQuestion(section.id, question.id, {
                                  showIf: { ...question.showIf, answer: e.target.value }
                                })}
                                className="text-xs input w-full"
                                placeholder="Show when answer equals..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addQuestion(section.id)}
                      className="w-full text-sm text-primary-600 hover:text-primary-700 border border-dashed border-primary-300 dark:border-primary-600 rounded-lg py-2"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssessment}
                disabled={loading || !builderData.title.trim()}
                className="btn-primary"
              >
                {loading ? <LoadingSpinner size="sm" /> : (editingAssessment ? 'Update' : 'Create')}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Live Preview</h4>
            
            <div className="space-y-6 overflow-y-auto h-full">
              {builderData.title && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {builderData.title}
                  </h3>
                  {builderData.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {builderData.description}
                    </p>
                  )}
                </div>
              )}

              {builderData.sections.map((section) => (
                <div key={section.id} className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {section.questions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {question.question || 'Question text...'}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        {question.type === 'single-choice' && question.options?.length > 0 && (
                          <div className="space-y-1">
                            {question.options.map((option, index) => (
                              <label key={index} className="flex items-center text-sm">
                                <input type="radio" name={question.id} className="mr-2" disabled />
                                {option || `Option ${index + 1}`}
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'multi-choice' && question.options?.length > 0 && (
                          <div className="space-y-1">
                            {question.options.map((option, index) => (
                              <label key={index} className="flex items-center text-sm">
                                <input type="checkbox" className="mr-2" disabled />
                                {option || `Option ${index + 1}`}
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'text-short' && (
                          <input
                            type="text"
                            className="input"
                            placeholder="Short text answer..."
                            disabled
                          />
                        )}

                        {question.type === 'text-long' && (
                          <textarea
                            rows={3}
                            className="input"
                            placeholder="Long text answer..."
                            disabled
                          />
                        )}

                        {question.type === 'numeric' && (
                          <input
                            type="number"
                            className="input"
                            placeholder="Numeric answer..."
                            disabled
                          />
                        )}

                        {question.type === 'file-upload' && (
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                            <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              File upload area
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Assessment Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Assessment Preview"
        size="lg"
      >
        {previewAssessment && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {previewAssessment.title}
              </h3>
              {previewAssessment.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {previewAssessment.description}
                </p>
              )}
            </div>

            <div className="space-y-8 max-h-96 overflow-y-auto">
              {previewAssessment.sections?.map((section) => (
                <div key={section.id} className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-6">
                    {section.questions?.map(renderPreviewQuestion)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handlePreviewSubmit}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Submit Assessment'}
              </button>
            </div>
          </div>
        )}
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

export default AssessmentsPage