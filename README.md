# 🚀 TALENTFLOW - Mini Hiring Platform

<div align="center">

![TALENTFLOW](https://img.shields.io/badge/TALENTFLOW-Hiring%20Platform-blueviolet?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)

A modern, full-featured hiring platform built with React, Vite, and TailwindCSS. Features complete job management, candidate tracking with Kanban boards, assessment builder with live preview, and comprehensive data persistence.

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture)

</div>

---

## ✨ Features

### 🎯 Core Functionality

#### 📋 Jobs Management
- ✅ **CRUD Operations**: Create, Read, Update, Delete jobs
- ✅ **Drag & Drop Reordering**: Intuitive job prioritization
- ✅ **Archive/Unarchive**: Manage job lifecycle
- ✅ **Pagination**: 10 jobs per page with navigation
- ✅ **Advanced Filtering**: Search by title, status, tags
- ✅ **Deep Linking**: Direct access via `/jobs/:jobId`
- ✅ **Optimistic Updates**: Instant UI feedback with rollback on failure
- ✅ **Form Validation**: Title required, unique slug generation

#### 👥 Candidates Tracking
- ✅ **Virtualized List**: Handles 1000+ candidates smoothly with react-window
- ✅ **Client-Side Search**: Real-time filtering by name/email
- ✅ **Stage Filtering**: Filter by current stage (Applied, Phone Screen, etc.)
- ✅ **Kanban Board**: Drag-and-drop between 6 stages
- ✅ **Candidate Profiles**: Detailed view at `/candidates/:id`
- ✅ **Timeline Visualization**: Track status changes over time
- ✅ **Notes with @Mentions**: Autocomplete team member mentions
- ✅ **Dual View Modes**: Switch between list and kanban views

#### 📝 Assessment Builder
- ✅ **Per-Job Assessments**: Link assessments to specific jobs
- ✅ **6 Question Types**:
  - Single Choice (Radio buttons)
  - Multiple Choice (Checkboxes)
  - Short Text (Single line)
  - Long Text (Multi-line)
  - Numeric (With range validation)
  - File Upload (Stub implementation)
- ✅ **Live Preview Pane**: Two-panel builder with real-time preview
- ✅ **Conditional Questions**: Show Q3 only if Q1 = "Yes"
- ✅ **Validation Rules**:
  - Required fields
  - Numeric range (min/max)
  - Max length for text
  - Custom validation logic
- ✅ **Persistent State**: All data saved to IndexedDB
- ✅ **Fillable Preview**: Test assessments before publishing

#### 📊 Analytics Dashboard
- ✅ **Key Metrics**: Total jobs, active jobs, candidates, offers
- ✅ **Stage Distribution**: Visual breakdown of candidates by stage
- ✅ **Progress Bars**: Percentage visualization
- ✅ **Real-time Updates**: Synced with database changes

### 🎨 UI/UX Features

- ✅ **Dark/Light Mode**: System preference detection with manual toggle
- ✅ **Responsive Design**: Mobile-first approach, fully optimized for all devices
- ✅ **Smooth Animations**: Framer Motion with 10-50ms transitions
- ✅ **Gradient Backgrounds**: Modern violet/fuchsia/cyan color scheme
- ✅ **3D Effects**: Shadows, hover states, and depth
- ✅ **Accessibility**: WCAG compliant with ARIA labels
- ✅ **Loading States**: Spinners and skeleton screens
- ✅ **Error Handling**: Toast notifications and inline errors
- ✅ **Optimistic Updates**: Instant feedback with rollback

### 🔧 Advanced Features

- ✅ **IndexedDB Persistence**: All data stored locally with Dexie.js
- ✅ **Mock API**: MirageJS with 10-50ms latency simulation
- ✅ **Seed Data**: 25 jobs, 1000 candidates, 20+ assessments
- ✅ **Deep Linking**: Shareable URLs for all resources
- ✅ **Notifications**: Working notification panel with redirects
- ✅ **Profile Settings**: Customizable user profile
- ✅ **Team Mentions**: @mention system in notes
- ✅ **Export Ready**: PDF/CSV export capabilities (stub)

---

## 🎬 Demo

### Screenshots

**Jobs Board**
- Drag-and-drop reordering
- Pagination and filtering
- Gradient tags and status badges

**Candidates Kanban**
- 6-stage pipeline visualization
- Drag cards between stages
- 1000+ candidates with virtualization

**Assessment Builder**
- Two-panel layout (builder + preview)
- 6 question types
- Conditional logic
- Live preview

**Analytics Dashboard**
- Key metrics cards
- Stage distribution charts
- Real-time data

---

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/amanrawat2004/talent-flow.git
cd talent-flow

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 7** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router 6** - Client-side routing

### State & Data
- **React Hooks** - State management (useState, useEffect, useMemo, useCallback)
- **Dexie.js** - IndexedDB wrapper for data persistence
- **MirageJS** - Mock API server with network simulation

### UI Components
- **Headless UI** - Unstyled accessible components
- **Heroicons** - Beautiful SVG icons
- **React Beautiful DnD** - Drag and drop functionality
- **React Window** - Virtualization for large lists

### Utilities
- **uuid** - Unique ID generation
- **jsPDF** - PDF export (stub)
- **html2canvas** - Screenshot capture (stub)

---

## 🏗 Architecture

### Project Structure

```
talent-flow/
├── src/
│   ├── components/          # React components
│   │   ├── JobsPage.jsx            # Jobs CRUD with pagination
│   │   ├── JobDetail.jsx           # Job detail view
│   │   ├── CandidatesPage.jsx      # Candidates list & kanban
│   │   ├── CandidateProfile.jsx    # Candidate detail with timeline
│   │   ├── AssessmentsPage.jsx     # Assessment builder
│   │   ├── AnalyticsPage.jsx       # Analytics dashboard
│   │   ├── ProfileSettings.jsx     # User profile settings
│   │   ├── Header.jsx              # Navigation header
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── Modal.jsx               # Reusable modal
│   │   └── LoadingSpinner.jsx      # Loading indicator
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useApi.js               # API calls with error handling
│   │   └── useTheme.js             # Theme management
│   │
│   ├── store/               # Data layer
│   │   └── database.js             # IndexedDB operations with Dexie
│   │
│   ├── api/                 # Mock API
│   │   └── mirage.js               # MirageJS server configuration
│   │
│   ├── data/                # Seed data
│   │   └── seedData.js             # Generate realistic test data
│   │
│   ├── utils/               # Utility functions
│   │   └── validation.js           # Form validation helpers
│   │
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles and Tailwind
│
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── README.md                # This file
```

### Data Flow

```
UI Actions → Custom Hooks → Mock API → IndexedDB
     ↓           ↓              ↓           ↓
  React      useApi.js     mirage.js   database.js
  State      (loading,     (latency,   (Dexie)
             errors)       failures)
```

### Key Architectural Decisions

1. **Single-Repo Structure**: All code in one repository for simplicity
2. **Component-Based**: Modular, reusable React components
3. **Custom Hooks**: Encapsulated logic for API calls and theme
4. **IndexedDB Storage**: Client-side persistence with automatic restoration
5. **Mock API Layer**: Realistic API simulation with error handling
6. **Optimistic Updates**: Immediate UI feedback with error rollback
7. **GPU Acceleration**: Transform-gpu for smooth 60fps animations

---

## 🎯 Features Breakdown

### Jobs Board

**Implemented Requirements:**
- ✅ List with pagination (10 per page)
- ✅ Filtering by title, status, tags
- ✅ Create/Edit in modal with validation
- ✅ Title required, unique slug generation
- ✅ Archive/Unarchive functionality
- ✅ Drag-and-drop reordering
- ✅ Optimistic updates with rollback
- ✅ Deep linking: `/jobs/:jobId`

**Technical Details:**
- Drag-and-drop: `react-beautiful-dnd`
- Validation: Custom validators in `utils/validation.js`
- Persistence: IndexedDB with Dexie
- API: MirageJS with 10-50ms latency

### Candidates Section

**Implemented Requirements:**
- ✅ Virtualized list (1000+ candidates)
- ✅ Client-side search (name/email)
- ✅ Server-like filter (current stage)
- ✅ Candidate profile: `/candidates/:id`
- ✅ Timeline of status changes
- ✅ Kanban board with drag-and-drop
- ✅ Notes with @mentions (autocomplete + highlighting)

**Technical Details:**
- Virtualization: `react-window` with 140px item height
- Kanban: `react-beautiful-dnd` with 6 stages
- Mentions: Custom autocomplete with regex highlighting
- Performance: useMemo for O(1) job lookups

### Assessments

**Implemented Requirements:**
- ✅ Assessment builder per job
- ✅ 6 question types (single-choice, multi-choice, text-short, text-long, numeric, file-upload)
- ✅ Live preview pane with fillable form
- ✅ Builder state persisted in IndexedDB
- ✅ Candidate responses persisted locally
- ✅ Validation: required, numeric range, max length
- ✅ Conditional questions (show Q3 if Q1 = Yes)

**Technical Details:**
- Two-panel layout: Builder (left) + Preview (right)
- Real-time preview updates
- Conditional logic: `shouldShowQuestion()` function
- Validation: `validateAssessmentResponse()` utility

---

## 📊 Seed Data

The application automatically generates realistic seed data on first load:

- **25 Jobs**: Various tech positions (Frontend, Backend, DevOps, etc.)
- **1000 Candidates**: Randomly distributed across jobs and stages
- **20+ Assessments**: One for each active job with 10+ questions
- **Mock Data**: Realistic names, emails, skills, experience levels

### Re-seeding Data

Click the **"Re-seed Data"** button on:
- Candidates page (regenerates all data)
- Assessments page (regenerates assessments only)

---

## 🎨 Design System

### Color Palette
- **Primary**: Violet (#8B5CF6) for actions and highlights
- **Secondary**: Fuchsia (#D946EF) for accents
- **Tertiary**: Cyan (#06B6D4) for info elements
- **Gray Scale**: Consistent gray tones for text and backgrounds
- **Status Colors**: 
  - Green (active/completed)
  - Red (rejected/error)
  - Yellow (pending/warning)
  - Blue (applied/info)

### Typography
- **Font**: System font stack (Inter, SF Pro, Segoe UI)
- **Hierarchy**: Clear heading levels (2xl, xl, lg, base, sm, xs)
- **Responsive**: Scales appropriately across device sizes

### Components
- **Cards**: Consistent elevation and border radius (8px)
- **Buttons**: Primary, secondary, and danger variants
- **Forms**: Unified input styling with validation states
- **Modals**: Centered overlays with backdrop
- **Animations**: 10-50ms transitions for 60fps performance

---

## ⚡ Performance Optimizations

### Implemented Optimizations
- ✅ **Virtualization**: react-window for 1000+ items
- ✅ **Memoization**: useMemo for expensive calculations
- ✅ **Callbacks**: useCallback for stable function references
- ✅ **GPU Acceleration**: transform-gpu CSS class
- ✅ **Lazy Loading**: Code splitting with React.lazy (ready)
- ✅ **Debouncing**: Search input debouncing (ready)
- ✅ **Optimistic Updates**: Instant UI feedback
- ✅ **Fast Animations**: 10-50ms transitions

### Performance Metrics
- **API Latency**: 10-50ms (configurable)
- **Animation Duration**: 10-50ms
- **Frame Rate**: 60fps target
- **Bundle Size**: ~500KB (gzipped)
- **First Load**: <2s on 3G

---

## 🔒 Data Persistence

### IndexedDB Schema

```javascript
{
  jobs: '++id, title, slug, status, createdAt, updatedAt, order',
  candidates: '++id, name, email, stage, jobId, createdAt, updatedAt',
  assessments: '++id, jobId, title, sections, createdAt, updatedAt',
  responses: '++id, candidateId, assessmentId, answers, submittedAt',
  notes: '++id, candidateId, content, authorId, createdAt',
  settings: 'key, value'
}
```

### Data Operations
- **Create**: Add new records with auto-incrementing IDs
- **Read**: Query with filters, pagination, search
- **Update**: Modify existing records with timestamp
- **Delete**: Remove records (soft delete ready)
- **Reorder**: Batch updates for drag-and-drop

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

### Manual Deployment

```bash
# Build
npm run build

# Upload dist/ folder to your web server
# Configure server for SPA routing (redirect all to index.html)
```

---

## 🧪 Testing

### Manual Testing Checklist

**Jobs:**
- [ ] Create new job
- [ ] Edit existing job
- [ ] Archive/Unarchive job
- [ ] Drag-and-drop reorder
- [ ] Search and filter
- [ ] Pagination navigation
- [ ] Deep link to job detail

**Candidates:**
- [ ] View 1000+ candidates in list
- [ ] Search by name/email
- [ ] Filter by stage
- [ ] Switch to kanban view
- [ ] Drag candidate between stages
- [ ] View candidate profile (mobile responsive)
- [ ] Add note with @mention
- [ ] View timeline

**Assessments:**
- [ ] Generate demo assessments
- [ ] Create new assessment
- [ ] Add sections and questions
- [ ] Test all 6 question types
- [ ] Set validation rules
- [ ] Add conditional question
- [ ] Preview assessment
- [ ] Fill and submit preview

**General:**
- [ ] Toggle dark/light mode
- [ ] Navigate between pages
- [ ] Click notifications
- [ ] Update profile settings
- [ ] Refresh page (data persists)

---

## 🐛 Known Issues & Limitations

### Current Limitations
- **File Upload**: Mock implementation (shows filename only)
- **User Authentication**: Single mock user
- **Real-time Updates**: No WebSocket implementation
- **Offline Support**: Limited offline functionality
- **Export**: PDF/CSV export is stub implementation
- **Email**: No actual email sending

### Future Enhancements
- [ ] Multi-user support with authentication
- [ ] Real file upload to cloud storage
- [ ] Email notifications and templates
- [ ] Calendar integration for interviews
- [ ] Advanced analytics with charts
- [ ] Collaborative notes with real-time sync
- [ ] Role-based access control
- [ ] Audit logs and activity tracking

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update README if adding features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aman Rawat**

- LinkedIn: [@amanrawat2004](https://linkedin.com/in/amanrawat2004)
- GitHub: [@amanrawat2004](https://github.com/amanrawat2004)
- Email: hr@entnt.com

---

## 🙏 Acknowledgments

- **React Team** - For the excellent framework
- **Vite Team** - For the blazing fast build tool
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Heroicons** - For beautiful SVG icons
- **Dexie.js** - For IndexedDB abstraction
- **MirageJS** - For mock API server

---

## 📚 Documentation

### Additional Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Dexie.js Documentation](https://dexie.org)
- [Framer Motion Documentation](https://www.framer.com/motion)

---

<div align="center">

**TALENTFLOW** - Streamlining the hiring process with modern web technology.

Made with ❤️ by [Aman Rawat](https://linkedin.com/in/amanrawat2004)

⭐ Star this repo if you find it helpful!

</div>
