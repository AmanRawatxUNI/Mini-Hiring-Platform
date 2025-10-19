import { createServer, Response } from 'miragejs'
import { dbOperations } from '../store/database.js'

// Mock API server with network latency and failure simulation
export function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,

    routes() {
      this.namespace = 'api'

      // Add network latency (10-50ms)
      this.timing = () => Math.random() * 40 + 10

      // Simulate 5-10% failure rate on write operations
      const shouldFail = () => Math.random() < 0.075

      // Jobs endpoints
      this.get('/jobs', async () => {
        const jobs = await dbOperations.getJobs()
        return jobs
      })

      this.post('/jobs', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }
        
        const attrs = JSON.parse(request.requestBody)
        try {
          const job = await dbOperations.createJob(attrs)
          return job
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      this.put('/jobs/:id', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }

        const id = parseInt(request.params.id)
        const attrs = JSON.parse(request.requestBody)
        try {
          const job = await dbOperations.updateJob(id, attrs)
          return job
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      this.delete('/jobs/:id', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }

        const id = parseInt(request.params.id)
        try {
          await dbOperations.deleteJob(id)
          return new Response(204)
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      this.post('/jobs/reorder', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }

        const { jobs } = JSON.parse(request.requestBody)
        try {
          await dbOperations.reorderJobs(jobs)
          return new Response(200)
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      // Candidates endpoints
      this.get('/candidates', async (schema, request) => {
        const { limit = 50, offset = 0, search } = request.queryParams
        
        if (search) {
          const candidates = await dbOperations.searchCandidates(search)
          return candidates
        }
        
        const candidates = await dbOperations.getCandidates(parseInt(limit), parseInt(offset))
        return candidates
      })

      this.put('/candidates/:id/stage', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }

        const id = parseInt(request.params.id)
        const { stage } = JSON.parse(request.requestBody)
        try {
          const candidate = await dbOperations.updateCandidateStage(id, stage)
          return candidate
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      // Assessments endpoints
      this.get('/assessments', async (schema, request) => {
        const { jobId } = request.queryParams
        const assessments = await dbOperations.getAssessments(parseInt(jobId))
        return assessments
      })

      this.post('/assessments', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }

        const attrs = JSON.parse(request.requestBody)
        try {
          const assessment = await dbOperations.createAssessment(attrs)
          return assessment
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      this.put('/assessments/:id', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }

        const id = parseInt(request.params.id)
        const attrs = JSON.parse(request.requestBody)
        try {
          const assessment = await dbOperations.updateAssessment(id, attrs)
          return assessment
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      // Responses endpoints
      this.post('/responses', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }

        const attrs = JSON.parse(request.requestBody)
        try {
          const response = await dbOperations.saveResponse(attrs)
          return response
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      this.get('/responses', async (schema, request) => {
        const { assessmentId } = request.queryParams
        const responses = await dbOperations.getResponses(parseInt(assessmentId))
        return responses
      })

      // Notes endpoints
      this.post('/notes', async (schema, request) => {
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Server error' })
        }

        const attrs = JSON.parse(request.requestBody)
        try {
          const note = await dbOperations.addNote(attrs)
          return note
        } catch (error) {
          return new Response(400, {}, { error: error.message })
        }
      })

      this.get('/notes/:candidateId', async (schema, request) => {
        const candidateId = parseInt(request.params.candidateId)
        const notes = await dbOperations.getNotes(candidateId)
        return notes
      })
    },
  })
}