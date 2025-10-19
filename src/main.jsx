import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { makeServer } from './api/mirage.js'

// Start Mirage server in development
if (import.meta.env.DEV) {
  makeServer()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)