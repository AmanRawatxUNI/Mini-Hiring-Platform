import { useState, useCallback } from 'react'

// Custom hook for API calls with loading states and error handling
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (apiCall, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      optimisticUpdate,
      rollback 
    } = options

    setLoading(true)
    setError(null)

    // Apply optimistic update if provided
    if (optimisticUpdate) {
      optimisticUpdate()
    }

    try {
      const result = await apiCall()
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      console.error('API Error:', err)
      setError(err.message || 'An error occurred')
      
      // Rollback optimistic update on error
      if (rollback) {
        rollback()
      }
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { request, loading, error, setError }
}

// API service functions
export const api = {
  // Jobs
  async getJobs() {
    const response = await fetch('/api/jobs')
    if (!response.ok) throw new Error('Failed to fetch jobs')
    return response.json()
  },

  async createJob(job) {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    })
    if (!response.ok) throw new Error('Failed to create job')
    return response.json()
  },

  async updateJob(id, updates) {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update job')
    return response.json()
  },

  async deleteJob(id) {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete job')
  },

  async reorderJobs(jobs) {
    const response = await fetch('/api/jobs/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs })
    })
    if (!response.ok) throw new Error('Failed to reorder jobs')
  },

  // Candidates
  async getCandidates(params = {}) {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`/api/candidates?${query}`)
    if (!response.ok) throw new Error('Failed to fetch candidates')
    return response.json()
  },

  async updateCandidateStage(id, stage) {
    const response = await fetch(`/api/candidates/${id}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage })
    })
    if (!response.ok) throw new Error('Failed to update candidate stage')
    return response.json()
  },

  // Assessments
  async getAssessments(jobId) {
    const response = await fetch(`/api/assessments?jobId=${jobId}`)
    if (!response.ok) throw new Error('Failed to fetch assessments')
    return response.json()
  },

  async createAssessment(assessment) {
    const response = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    })
    if (!response.ok) throw new Error('Failed to create assessment')
    return response.json()
  },

  async updateAssessment(id, updates) {
    const response = await fetch(`/api/assessments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update assessment')
    return response.json()
  },

  // Responses
  async saveResponse(response) {
    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    })
    if (!res.ok) throw new Error('Failed to save response')
    return res.json()
  },

  async getResponses(assessmentId) {
    const response = await fetch(`/api/responses?assessmentId=${assessmentId}`)
    if (!response.ok) throw new Error('Failed to fetch responses')
    return response.json()
  },

  // Notes
  async addNote(note) {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    })
    if (!response.ok) throw new Error('Failed to add note')
    return response.json()
  },

  async getNotes(candidateId) {
    const response = await fetch(`/api/notes/${candidateId}`)
    if (!response.ok) throw new Error('Failed to fetch notes')
    return response.json()
  }
}