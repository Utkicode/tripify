import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async';
import { ProfileProvider } from './context/ProfileContext'

import ErrorBoundary from './components/common/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)