import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ProfileProvider } from './context/ProfileContext'

import ErrorBoundary from './components/common/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)