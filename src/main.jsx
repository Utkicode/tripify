import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async';
import { ProfileProvider } from './context/ProfileContext'

import ErrorBoundary from './components/common/ErrorBoundary'

// PWA Manual Registration
import { registerSW } from 'virtual:pwa-register'

try {
  registerSW({
    onOfflineReady() {
      console.log('App ready to work offline');
    },
    onRegisterError(error) {
      console.warn('SW registration failed (likely blocked by browser extension/antivirus):', error);
    }
  });
} catch (e) {
  console.warn('SW registration bypassed:', e);
}

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