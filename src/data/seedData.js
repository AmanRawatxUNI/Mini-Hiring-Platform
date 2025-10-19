import { v4 as uuidv4 } from 'uuid'
import { dbOperations } from '../store/database.js'

// Generate realistic seed data for the application
const jobTitles = [
  'Senior Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer',
  'Product Manager', 'UX Designer', 'Data Scientist', 'Mobile Developer',
  'QA Engineer', 'Technical Lead', 'Software Architect', 'Site Reliability Engineer',
  'Machine Learning Engineer', 'Security Engineer', 'Database Administrator', 'Cloud Engineer',
  'Business Analyst', 'Scrum Master', 'UI Designer', 'Platform Engineer',
  'Integration Developer', 'Performance Engineer', 'Solutions Architect', 'Technical Writer',
  'Customer Success Manager'
]

const companies = ['TechCorp', 'InnovateLabs', 'DataFlow', 'CloudSystems', 'NextGen']
const locations = ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston', 'Remote']
const stages = ['Applied', 'Phone Screen', 'Technical Interview', 'Final Interview', 'Offer', 'Rejected']

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Sage', 'River', 'Phoenix', 'Skyler', 'Cameron', 'Emery', 'Finley', 'Hayden',
  'Jamie', 'Kendall', 'Logan', 'Micah', 'Noah', 'Parker', 'Reese', 'Rowan',
  'Sam', 'Tatum', 'Blake', 'Drew', 'Ellis', 'Gray', 'Harper', 'Indigo',
  'Jules', 'Kai', 'Lane', 'Max', 'Nico', 'Ocean', 'Peyton', 'Remy'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
]

const skills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'AWS', 'Docker',
  'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Git', 'CI/CD', 'Agile'
]

function generateSlug(title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function randomChoices(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Generate jobs
export function generateJobs() {
  return jobTitles.map((title, index) => ({
    title,
    slug: generateSlug(title),
    description: `We are looking for a talented ${title} to join our growing team. This role offers exciting opportunities to work with cutting-edge technologies and make a significant impact.`,
    requirements: randomChoices(skills, 3 + Math.floor(Math.random() * 3)).join(', '),
    location: randomChoice(locations),
    company: randomChoice(companies),
    salary: `$${(80 + Math.floor(Math.random() * 120)) * 1000} - $${(120 + Math.floor(Math.random() * 80)) * 1000}`,
    type: randomChoice(['Full-time', 'Contract', 'Part-time']),
    status: Math.random() > 0.2 ? 'active' : 'archived',
    tags: randomChoices(['Remote', 'Senior', 'Junior', 'Urgent', 'New'], 1 + Math.floor(Math.random() * 3)),
    order: index,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }))
}

// Generate candidates
export function generateCandidates(jobs) {
  const candidates = []
  
  for (let i = 0; i < 1000; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
    const jobId = randomChoice(jobs).id
    
    candidates.push({
      name: `${firstName} ${lastName}`,
      email,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      jobId,
      stage: randomChoice(stages),
      experience: `${Math.floor(Math.random() * 10) + 1} years`,
      skills: randomChoices(skills, 2 + Math.floor(Math.random() * 4)).join(', '),
      resume: `resume_${i + 1}.pdf`,
      appliedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    })
  }
  
  return candidates
}

// Generate assessments
export function generateAssessments(jobs) {
  const assessments = []
  
  // Create assessment for each job
  const selectedJobs = jobs.filter(job => job.status === 'active')
  
  selectedJobs.forEach((job, index) => {
    const sections = [
      {
        id: uuidv4(),
        title: 'Technical Skills',
        description: 'Assess technical competency',
        questions: [
          {
            id: uuidv4(),
            type: 'single-choice',
            question: 'What is your primary programming language?',
            required: true,
            options: ['JavaScript', 'Python', 'Java', 'C++', 'Other']
          },
          {
            id: uuidv4(),
            type: 'multi-choice',
            question: 'Which frameworks have you worked with?',
            required: true,
            options: ['React', 'Vue', 'Angular', 'Express', 'Django', 'Spring']
          },
          {
            id: uuidv4(),
            type: 'text-long',
            question: 'Describe a challenging technical problem you solved recently.',
            required: true,
            maxLength: 1000
          },
          {
            id: uuidv4(),
            type: 'numeric',
            question: 'How many years of experience do you have?',
            required: true,
            min: 0,
            max: 50
          }
        ]
      },
      {
        id: uuidv4(),
        title: 'Experience & Background',
        description: 'Learn about candidate background',
        questions: [
          {
            id: uuidv4(),
            type: 'text-short',
            question: 'Current job title',
            required: true,
            maxLength: 100
          },
          {
            id: uuidv4(),
            type: 'file-upload',
            question: 'Upload your portfolio or work samples',
            required: false,
            acceptedTypes: ['.pdf', '.zip', '.jpg', '.png']
          },
          {
            id: uuidv4(),
            type: 'single-choice',
            question: 'Preferred work arrangement',
            required: true,
            options: ['Remote', 'Hybrid', 'On-site', 'Flexible']
          },
          {
            id: uuidv4(),
            type: 'text-long',
            question: 'Why are you interested in this position?',
            required: true,
            maxLength: 500
          }
        ]
      },
      {
        id: uuidv4(),
        title: 'Additional Information',
        description: 'Final questions',
        questions: [
          {
            id: uuidv4(),
            type: 'numeric',
            question: 'Expected salary (in thousands)',
            required: false,
            min: 50,
            max: 300
          },
          {
            id: uuidv4(),
            type: 'single-choice',
            question: 'How did you hear about us?',
            required: false,
            options: ['LinkedIn', 'Company Website', 'Referral', 'Job Board', 'Other']
          },
          {
            id: uuidv4(),
            type: 'text-short',
            question: 'Any questions for us?',
            required: false,
            maxLength: 200
          }
        ]
      }
    ]
    
    assessments.push({
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Comprehensive assessment for ${job.title} candidates`,
      sections,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })
  
  return assessments
}

// Seed the database
export async function seedDatabase(force = false) {
  try {
    // Check if already seeded
    const existingJobs = await dbOperations.getJobs()
    console.log('Existing jobs count:', existingJobs.length)
    
    if (existingJobs.length > 0 && !force) {
      console.log('Database already seeded')
      return
    }
    
    // Clear existing data if force seeding
    if (force) {
      console.log('Force re-seeding database...')
      await dbOperations.db.jobs.clear()
      await dbOperations.db.candidates.clear()
      await dbOperations.db.assessments.clear()
      await dbOperations.db.notes.clear()
    }
    
    console.log('Starting database seeding...')

    console.log('Seeding database...')
    
    // Generate and insert jobs
    const jobs = generateJobs()
    const insertedJobs = []
    for (const job of jobs) {
      const insertedJob = await dbOperations.createJob(job)
      insertedJobs.push(insertedJob)
    }
    
    // Generate and insert candidates
    const candidates = generateCandidates(insertedJobs)
    for (const candidate of candidates) {
      await dbOperations.db.candidates.add(candidate)
    }
    
    // Generate and insert assessments
    const assessments = generateAssessments(insertedJobs)
    for (const assessment of assessments) {
      await dbOperations.createAssessment(assessment)
    }
    
    // Set initial settings
    await dbOperations.setSetting('theme', 'dark')
    await dbOperations.setSetting('seeded', true)
    
    console.log('✅ Database seeded successfully!')
    console.log(`✅ ${insertedJobs.length} jobs created`)
    console.log(`✅ ${candidates.length} candidates created`)
    console.log(`✅ ${assessments.length} assessments created`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    console.error('Error details:', error.message, error.stack)
    throw error
  }
}