import Dexie from 'dexie'

// IndexedDB database schema and operations
export class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB')
    
    this.version(1).stores({
      jobs: '++id, title, slug, status, createdAt, updatedAt, order',
      candidates: '++id, name, email, stage, jobId, createdAt, updatedAt',
      assessments: '++id, jobId, title, sections, createdAt, updatedAt',
      responses: '++id, candidateId, assessmentId, answers, submittedAt',
      notes: '++id, candidateId, content, authorId, createdAt',
      settings: 'key, value'
    })
  }
}

export const db = new TalentFlowDB()

// Database operations with error handling
export const dbOperations = {
  db, // Export db instance for direct access
  // Jobs
  async getJobs() {
    try {
      return await db.jobs.orderBy('order').toArray()
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  },

  async createJob(job) {
    try {
      const maxOrder = await db.jobs.orderBy('order').last()
      const newJob = {
        ...job,
        order: (maxOrder?.order || 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const id = await db.jobs.add(newJob)
      return { ...newJob, id }
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  },

  async updateJob(id, updates) {
    try {
      await db.jobs.update(id, { ...updates, updatedAt: new Date() })
      return await db.jobs.get(id)
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  },

  async deleteJob(id) {
    try {
      await db.jobs.delete(id)
    } catch (error) {
      console.error('Error deleting job:', error)
      throw error
    }
  },

  async reorderJobs(jobs) {
    try {
      await db.transaction('rw', db.jobs, async () => {
        for (let i = 0; i < jobs.length; i++) {
          await db.jobs.update(jobs[i].id, { order: i })
        }
      })
    } catch (error) {
      console.error('Error reordering jobs:', error)
      throw error
    }
  },

  // Candidates
  async getCandidates(limit = 10000, offset = 0) {
    try {
      if (limit === 10000) {
        return await db.candidates.toArray()
      }
      return await db.candidates.offset(offset).limit(limit).toArray()
    } catch (error) {
      console.error('Error fetching candidates:', error)
      return []
    }
  },

  async searchCandidates(query) {
    try {
      return await db.candidates
        .filter(candidate => 
          candidate.name.toLowerCase().includes(query.toLowerCase()) ||
          candidate.email.toLowerCase().includes(query.toLowerCase())
        )
        .toArray()
    } catch (error) {
      console.error('Error searching candidates:', error)
      return []
    }
  },

  async updateCandidateStage(id, stage) {
    try {
      await db.candidates.update(id, { stage, updatedAt: new Date() })
      return await db.candidates.get(id)
    } catch (error) {
      console.error('Error updating candidate stage:', error)
      throw error
    }
  },

  // Assessments
  async getAssessments(jobId) {
    try {
      return await db.assessments.where('jobId').equals(jobId).toArray()
    } catch (error) {
      console.error('Error fetching assessments:', error)
      return []
    }
  },

  async createAssessment(assessment) {
    try {
      const newAssessment = {
        ...assessment,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const id = await db.assessments.add(newAssessment)
      return { ...newAssessment, id }
    } catch (error) {
      console.error('Error creating assessment:', error)
      throw error
    }
  },

  async updateAssessment(id, updates) {
    try {
      await db.assessments.update(id, { ...updates, updatedAt: new Date() })
      return await db.assessments.get(id)
    } catch (error) {
      console.error('Error updating assessment:', error)
      throw error
    }
  },

  // Responses
  async saveResponse(response) {
    try {
      const newResponse = {
        ...response,
        submittedAt: new Date()
      }
      const id = await db.responses.add(newResponse)
      return { ...newResponse, id }
    } catch (error) {
      console.error('Error saving response:', error)
      throw error
    }
  },

  async getResponses(assessmentId) {
    try {
      return await db.responses.where('assessmentId').equals(assessmentId).toArray()
    } catch (error) {
      console.error('Error fetching responses:', error)
      return []
    }
  },

  // Notes
  async addNote(note) {
    try {
      const newNote = {
        ...note,
        createdAt: new Date()
      }
      const id = await db.notes.add(newNote)
      return { ...newNote, id }
    } catch (error) {
      console.error('Error adding note:', error)
      throw error
    }
  },

  async getNotes(candidateId) {
    try {
      return await db.notes.where('candidateId').equals(candidateId).toArray()
    } catch (error) {
      console.error('Error fetching notes:', error)
      return []
    }
  },

  // Settings
  async getSetting(key) {
    try {
      const setting = await db.settings.get(key)
      return setting?.value
    } catch (error) {
      console.error('Error fetching setting:', error)
      return null
    }
  },

  async setSetting(key, value) {
    try {
      await db.settings.put({ key, value })
    } catch (error) {
      console.error('Error setting value:', error)
      throw error
    }
  }
}