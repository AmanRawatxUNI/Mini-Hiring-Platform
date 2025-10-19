import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Export utilities for reports and data
export const exportUtils = {
  // Export data as CSV
  exportToCSV(data, filename) {
    if (!data || data.length === 0) return
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ''
        }).join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
  },

  // Export element as PDF
  async exportToPDF(elementId, filename) {
    try {
      const element = document.getElementById(elementId)
      if (!element) throw new Error('Element not found')
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      throw error
    }
  },

  // Generate candidate report data
  generateCandidateReport(candidates, jobs) {
    return candidates.map(candidate => {
      const job = jobs.find(j => j.id === candidate.jobId)
      return {
        Name: candidate.name,
        Email: candidate.email,
        Phone: candidate.phone || '',
        Job: job?.title || 'Unknown',
        Stage: candidate.stage,
        Experience: candidate.experience || '',
        Skills: candidate.skills || '',
        'Applied Date': candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString() : '',
        'Last Updated': candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleDateString() : ''
      }
    })
  },

  // Generate job report data
  generateJobReport(jobs, candidates) {
    return jobs.map(job => {
      const jobCandidates = candidates.filter(c => c.jobId === job.id)
      const stageCount = jobCandidates.reduce((acc, candidate) => {
        acc[candidate.stage] = (acc[candidate.stage] || 0) + 1
        return acc
      }, {})
      
      return {
        Title: job.title,
        Status: job.status,
        Location: job.location || '',
        Company: job.company || '',
        'Total Candidates': jobCandidates.length,
        Applied: stageCount['Applied'] || 0,
        'Phone Screen': stageCount['Phone Screen'] || 0,
        'Technical Interview': stageCount['Technical Interview'] || 0,
        'Final Interview': stageCount['Final Interview'] || 0,
        Offer: stageCount['Offer'] || 0,
        Rejected: stageCount['Rejected'] || 0,
        'Created Date': job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ''
      }
    })
  },

  // Generate assessment responses report
  generateAssessmentReport(responses, assessment, candidates) {
    return responses.map(response => {
      const candidate = candidates.find(c => c.id === response.candidateId)
      const answers = response.answers || {}
      
      const reportData = {
        'Candidate Name': candidate?.name || 'Unknown',
        'Candidate Email': candidate?.email || 'Unknown',
        'Submitted Date': response.submittedAt ? new Date(response.submittedAt).toLocaleDateString() : ''
      }
      
      // Add answers for each question
      assessment.sections?.forEach(section => {
        section.questions?.forEach(question => {
          const answer = answers[question.id]
          let displayValue = ''
          
          if (answer !== undefined && answer !== null) {
            if (Array.isArray(answer)) {
              displayValue = answer.join(', ')
            } else {
              displayValue = String(answer)
            }
          }
          
          reportData[question.question] = displayValue
        })
      })
      
      return reportData
    })
  }
}