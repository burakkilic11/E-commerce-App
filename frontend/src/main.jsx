import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'; // Router'ı import et
import { AuthProvider } from './contexts/AuthContext';    // AuthProvider'ı import et

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* Router'ı en dışa alalım */}
      <AuthProvider> {/* AuthProvider ile App'i sar */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)