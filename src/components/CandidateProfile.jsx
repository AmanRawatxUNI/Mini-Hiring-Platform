import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useApi, api } from '../hooks/useApi.js'
import LoadingSpinner from './LoadingSpinner.jsx'

const CandidateProfile = () => {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [job, setJob] = useState(null)
  const [notes, setNotes] = useState([])
  const [timeline, setTimeline] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const { request, loading, error } = useApi()

  // Mock team members for @mentions
  const teamMembers = [
    { id: 1, name: 'HR Manager', email: 'hr@company.com' },
    { id: 2, name: 'Tech Lead', email: 'tech@company.com' },
    { id: 3, name: 'Hiring Manager', email: 'hiring@company.com' },
    { id: 4, name: 'Recruiter', email: 'recruiter@company.com' }
  ]

  useEffect(() => {
    loadCandidateData()
  }, [candidateId])

  const loadCandidateData = async () => {
    try {
      // Load candidate details
      const candidates = await request(api.getCandidates)
      const currentCandidate = candidates.find(c => c.id.toString() === candidateId)
      
      if (!currentCandidate) {
        navigate('/candidates')
        return
      }
      
      setCandidate(currentCandidate)

      // Load job details
      const jobs = await request(api.getJobs)
      const candidateJob = jobs.find(j => j.id === currentCandidate.jobId)
      setJob(candidateJob)

      // Load notes
      const candidateNotes = await request(() => api.getNotes(parseInt(candidateId)))
      setNotes(candidateNotes)

      // Generate timeline (mock data for now)
      generateTimeline(currentCandidate)
    } catch (err) {
      console.error('Error loading candidate data:', err)
    }
  }

  const generateTimeline = (candidate) => {
    const stages = ['Applied', 'Phone Screen', 'Technical Interview', 'Final Interview', 'Offer', 'Rejected']
    const currentStageIndex = stages.indexOf(candidate.stage)
    
    const timelineEvents = []
    
    // Add application event
    timelineEvents.push({
      id: 1,
      type: 'application',
      title: 'Application Submitted',
      description: `Applied for ${job?.title || 'position'}`,
      date: candidate.appliedAt || candidate.createdAt,
      status: 'completed',
      icon: CheckCircleIcon
    })

    // Add stage progression events
    stages.slice(1, currentStageIndex + 1).forEach((stage, index) => {
      const daysAgo = (stages.length - index - 1) * 2
      const eventDate = new Date()
      eventDate.setDate(eventDate.getDate() - daysAgo)
      
      timelineEvents.push({
        id: index + 2,
        type: 'stage_change',
        title: `Moved to ${stage}`,
        description: `Candidate progressed to ${stage} stage`,
        date: eventDate,
        status: 'completed',
        icon: CheckCircleIcon
      })
    })

    // Add current stage if not rejected
    if (candidate.stage !== 'Rejected' && currentStageIndex < stages.length - 1) {
      timelineEvents.push({
        id: timelineEvents.length + 1,
        type: 'current',
        title: `Currently in ${candidate.stage}`,
        description: 'Awaiting next steps',
        date: new Date(),
        status: 'current',
        icon: ClockIcon
      })
    }

    // Add rejection if applicable
    if (candidate.stage === 'Rejected') {
      timelineEvents.push({
        id: timelineEvents.length + 1,
        type: 'rejection',
        title: 'Application Rejected',
        description: 'Candidate was not selected for this position',
        date: new Date(),
        status: 'rejected',
        icon: XCircleIcon
      })
    }

    setTimeline(timelineEvents.reverse())
  }

  const handleNoteChange = (e) => {
    const value = e.target.value
    const position = e.target.selectionStart
    setNewNote(value)
    setCursorPosition(position)

    // Check for @ mention
    const textBeforeCursor = value.substring(0, position)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt.toLowerCase())
        setShowMentions(true)
        return
      }
    }
    
    setShowMentions(false)
  }

  const insertMention = (member) => {
    const textBeforeCursor = newNote.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    const textAfterCursor = newNote.substring(cursorPosition)
    
    const newText = newNote.substring(0, lastAtIndex) + `@${member.name} ` + textAfterCursor
    setNewNote(newText)
    setShowMentions(false)
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionSearch)
  )

  const addNote = async () => {
    if (!newNote.trim()) return

    const noteData = {
      candidateId: parseInt(candidateId),
      content: newNote,
      authorId: 1,
      author: 'HR Manager'
    }

    await request(() => api.addNote(noteData), {
      onSuccess: (note) => {
        setNotes([note, ...notes])
        setNewNote('')
        setShowMentions(false)
      }
    })
  }

  const stageColors = {
    'Applied': 'from-blue-500 to-blue-600',
    'Phone Screen': 'from-yellow-500 to-yellow-600',
    'Technical Interview': 'from-purple-500 to-purple-600',
    'Final Interview': 'from-orange-500 to-orange-600',
    'Offer': 'from-green-500 to-green-600',
    'Rejected': 'from-red-500 to-red-600'
  }

  if (loading && !candidate) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Candidate not found</h2>
        <Link to="/candidates" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          ← Back to Candidates
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="relative">
          <button
            onClick={() => navigate('/candidates')}
            className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Candidates
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
                <UserCircleIcon className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
              </div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${stageColors[candidate.stage]} rounded-full flex items-center justify-center border-4 border-gray-900`}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{candidate.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/90 mb-4">
                <div className="flex items-center min-w-0">
                  <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-sm sm:text-base">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{candidate.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-white/80 mb-4">
                <div className="flex items-center min-w-0">
                  <BriefcaseIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-sm sm:text-base">{job?.title || 'Unknown Position'}</span>
                </div>
                {candidate.experience && (
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{candidate.experience}</span>
                  </div>
                )}
              </div>

              <div className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r ${stageColors[candidate.stage]} rounded-full text-white font-medium text-sm sm:text-base`}>
                {candidate.stage}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Application Timeline</h3>
            
            <div className="relative">
              {timeline.map((event, index) => {
                const Icon = event.icon
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="relative flex items-start space-x-4 pb-8 last:pb-0"
                  >
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                    )}
                    
                    {/* Icon */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 ${
                      event.status === 'completed' 
                        ? 'bg-green-500' 
                        : event.status === 'current'
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                    }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {event.title}
                        </h4>
                        <time className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.date).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Skills */}
          {candidate.skills && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.split(', ').map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="px-3 py-1 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-700"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notes</h3>
            
            {/* Add Note */}
            <div className="space-y-3 mb-6">
              <div className="relative">
                <textarea
                  value={newNote}
                  onChange={handleNoteChange}
                  rows={3}
                  className="input"
                  placeholder="Add a note... (type @ to mention team members)"
                />
                
                {/* Mention Suggestions */}
                {showMentions && filteredMembers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => insertMention(member)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {member.email}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
              <button
                onClick={addNote}
                disabled={!newNote.trim() || loading}
                className="btn-primary w-full"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {note.author || 'HR Manager'}
                      </span>
                      <time className="text-xs text-gray-500 dark:text-gray-400">
                        {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Just now'}
                      </time>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {note.content.split(/(@\w+(?:\s\w+)*)/).map((part, i) => 
                        part.startsWith('@') ? (
                          <span key={i} className="text-primary-600 dark:text-primary-400 font-medium">
                            {part}
                          </span>
                        ) : part
                      )}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No notes yet. Add the first note above.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Schedule Interview
              </button>
              <button className="w-full btn-secondary">
                Send Email
              </button>
              <button className="w-full btn-secondary">
                Download Resume
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CandidateProfile