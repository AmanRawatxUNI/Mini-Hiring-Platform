import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FixedSizeList as List } from 'react-window'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  UserCircleIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useApi, api } from '../hooks/useApi.js'
import LoadingSpinner from './LoadingSpinner.jsx'
import Modal from './Modal.jsx'

const stages = ['Applied', 'Phone Screen', 'Technical Interview', 'Final Interview', 'Offer', 'Rejected']

const stageColors = {
  'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'Phone Screen': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'Technical Interview': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  'Final Interview': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'Offer': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
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
    loadData()
  }, [])

  const forceReseed = async () => {
    if (confirm('This will delete all data and regenerate 1000 candidates. Continue?')) {
      const { seedDatabase } = await import('../data/seedData.js')
      await seedDatabase(true)
      loadData()
    }
  }

  const loadData = async () => {
    // Load candidates and jobs in parallel
    await Promise.all([
      request(api.getCandidates, {
        onSuccess: setCandidates
      }),
      request(api.getJobs, {
        onSuccess: setJobs
      })
    ])
  }

  const filteredCandidates = useMemo(() => {
    let filtered = candidates

    if (searchQuery) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.stage === stageFilter)
    }

    return filtered
  }, [candidates, searchQuery, stageFilter])

  const candidatesByStage = useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage] = filteredCandidates.filter(candidate => candidate.stage === stage)
      return acc
    }, {})
  }, [filteredCandidates])

  const handleStageChange = useCallback(async (candidateId, newStage) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return

    await request(() => api.updateCandidateStage(candidateId, newStage), {
      onSuccess: (updatedCandidate) => {
        setCandidates(prev => prev.map(c => c.id === candidateId ? updatedCandidate : c))
      },
      optimisticUpdate: () => {
        setCandidates(prev => prev.map(c => 
          c.id === candidateId ? { ...c, stage: newStage } : c
        ))
      },
      rollback: () => {
        setCandidates(prev => prev.map(c => 
          c.id === candidateId ? candidate : c
        ))
      }
    })
  }, [candidates, request])

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    const candidateId = parseInt(draggableId)
    const newStage = destination.droppableId

    if (source.droppableId !== newStage) {
      const candidate = candidates.find(c => c.id === candidateId)
      if (!candidate) return

      request(() => api.updateCandidateStage(candidateId, newStage), {
        onSuccess: (updatedCandidate) => {
          setCandidates(prev => prev.map(c => c.id === candidateId ? updatedCandidate : c))
        },
        optimisticUpdate: () => {
          setCandidates(prev => prev.map(c => 
            c.id === candidateId ? { ...c, stage: newStage } : c
          ))
        },
        rollback: () => {
          setCandidates(prev => prev.map(c => 
            c.id === candidateId ? candidate : c
          ))
        }
      })
    }
  }, [candidates, request])

  const openNotesModal = async (candidate) => {
    setSelectedCandidate(candidate)
    setIsNotesModalOpen(true)
    
    // Load notes for this candidate
    await request(() => api.getNotes(candidate.id), {
      onSuccess: setNotes
    })
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
    if (!newNote.trim() || !selectedCandidate) return

    const noteData = {
      candidateId: selectedCandidate.id,
      content: newNote,
      authorId: 1,
      author: 'HR Manager'
    }

    await request(() => api.addNote(noteData), {
      onSuccess: (note) => {
        setNotes([...notes, note])
        setNewNote('')
        setShowMentions(false)
      }
    })
  }

  // Memoize job lookup for performance
  const jobsMap = useMemo(() => {
    return jobs.reduce((acc, job) => {
      acc[job.id] = job
      return acc
    }, {})
  }, [jobs])

  // Virtualized list item renderer
  const CandidateItem = ({ index, style }) => {
    const candidate = filteredCandidates[index]
    const job = jobsMap[candidate.jobId]

    return (
      <div style={style}>
        <Link to={`/candidates/${candidate.id}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
            className="mx-4 mb-4 p-4 card hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
          >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <UserCircleIcon className="h-12 w-12 text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                  {candidate.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[candidate.stage]}`}>
                  {candidate.stage}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {candidate.email}
              </p>
              
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{job?.title || 'Unknown Position'}</span>
                {candidate.experience && <span>• {candidate.experience}</span>}
              </div>
              
              {candidate.skills && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {candidate.skills.split(', ').slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.split(', ').length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{candidate.skills.split(', ').length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </Link>
      </div>
    )
  }

  // Kanban card component
  const KanbanCard = ({ candidate, index }) => {
    const job = jobsMap[candidate.jobId]

    return (
      <Draggable draggableId={candidate.id.toString()} index={index}>
        {(provided, snapshot) => (
          <motion.div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
            className={`p-3 mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow ${
              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
            }`}
            onClick={() => openNotesModal(candidate)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                {candidate.name}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openNotesModal(candidate)
                }}
                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
              {candidate.email}
            </p>
            
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate">
              {job?.title || 'Unknown Position'}
            </p>
            
            {candidate.experience && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {candidate.experience}
              </p>
            )}
          </motion.div>
        )}
      </Draggable>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Candidates
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage candidate applications and track progress
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Link
            to="/analytics"
            className="px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center"
          >
            <ChartBarIcon className="h-4 w-4 mr-1" />
            Analytics
          </Link>
          <button
            onClick={forceReseed}
            className="px-3 py-2 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Re-seed Data
          </button>
          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-l-lg ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-r-lg ${
                viewMode === 'kanban'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Stage Filter */}
          <div className="relative sm:w-48">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 pl-10 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && candidates.length === 0 ? (
        <div className="card p-8">
          <LoadingSpinner />
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {filteredCandidates.length} Candidates
            </h3>
          </div>
          
          {filteredCandidates.length > 0 ? (
            <List
              height={600}
              itemCount={filteredCandidates.length}
              itemSize={140}
              className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
            >
              {CandidateItem}
            </List>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No candidates found
            </div>
          )}
        </div>
      ) : (
        /* Kanban View */
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stages.map((stage) => (
              <div key={stage} className="card">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {stage}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stageColors[stage]}`}>
                      {candidatesByStage[stage]?.length || 0}
                    </span>
                  </div>
                </div>
                
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 min-h-[400px] ${
                        snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                      }`}
                    >
                      {candidatesByStage[stage]?.map((candidate, index) => (
                        <KanbanCard
                          key={candidate.id}
                          candidate={candidate}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Notes Modal */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title={selectedCandidate ? `${selectedCandidate.name} - Notes & Timeline` : 'Candidate Notes'}
        size="lg"
      >
        {selectedCandidate && (
          <div className="space-y-6">
            {/* Candidate Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <UserCircleIcon className="h-16 w-16 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {selectedCandidate.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{selectedCandidate.email}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stageColors[selectedCandidate.stage]}`}>
                    {selectedCandidate.stage}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {jobs.find(j => j.id === selectedCandidate.jobId)?.title || 'Unknown Position'}
                  </span>
                </div>
              </div>
            </div>

            {/* Add Note */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Add Note (use @ to mention team members)
              </label>
              <div className="relative">
                <div className="flex space-x-3">
                  <textarea
                    value={newNote}
                    onChange={handleNoteChange}
                    rows={3}
                    className="flex-1 input"
                    placeholder="Add a note about this candidate... (type @ to mention)"
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim() || loading}
                    className="btn-primary self-start"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Mention Suggestions */}
                {showMentions && filteredMembers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
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
            </div>

            {/* Notes Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Timeline</h4>
              
              {notes.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex space-x-3"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                          <ChatBubbleLeftIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {note.author || 'HR Manager'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {note.content.split(/(@\w+(?:\s\w+)*)/).map((part, i) => 
                            part.startsWith('@') ? (
                              <span key={i} className="text-primary-600 dark:text-primary-400 font-medium">
                                {part}
                              </span>
                            ) : part
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No notes yet. Add the first note above.
                </p>
              )}
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

export default CandidatesPage