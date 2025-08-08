import React, { useState } from 'react';
import { Menu, User, Bell, Moon, Sun } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import FieldVisualization from './pages/FieldVisualization';
import RainfallTracking from './pages/RainfallTracking';
import FertilizerManagement from './pages/FertilizerManagement';
import WorkerManagement from './pages/WorkerManagement';
import AccountingManagement from './pages/AccountingManagement';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSelector from './components/LanguageSelector';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; darkMode?: boolean; t: (key: string) => string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; darkMode?: boolean; t: (key: string) => string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { darkMode = false, t } = this.props;
      
      return (
        <div className={`flex items-center justify-center h-full min-h-96 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className={`text-center p-8 rounded-lg shadow-lg max-w-md mx-4 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-red-600 dark:text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {t('somethingWentWrong')}
              </h2>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('errorOccurred')}
              </p>
              <ul className={`text-xs text-left space-y-1 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <li>• {t('missingComponentFiles')}</li>
                <li>• {t('databaseConnectionIssues')}</li>
                <li>• {t('invalidConfiguration')}</li>
              </ul>
            </div>
            
            {this.state.error && (
              <details className={`text-left mb-4 p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <summary className={`cursor-pointer text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('errorDetails')}
                </summary>
                <pre className={`mt-2 text-xs whitespace-pre-wrap ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="space-y-2">
              <button 
                onClick={() => this.setState({ hasError: false, error: null })}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {t('tryAgain')}
              </button>
              <button 
                onClick={() => window.location.

reload()}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {t('reloadPage')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
function App() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ErrorBoundary darkMode={darkMode} t={t}>
            <DashboardHome darkMode={darkMode} />
          </ErrorBoundary>
        );
      case 'fields':
        return (
          <ErrorBoundary darkMode={darkMode} t={t}>
            <FieldVisualization darkMode={darkMode} />
          </ErrorBoundary>
        );
      case 'rainfall':
        return (
          <ErrorBoundary darkMode={darkMode} t={t}>
            <RainfallTracking darkMode={darkMode} />
          </ErrorBoundary>
        );
      case 'fertilizer':
        return (
          <ErrorBoundary darkMode={darkMode} t={t}>
            <FertilizerManagement darkMode={darkMode} />
          </ErrorBoundary>
        );
      case 'workers':
        return (
          <ErrorBoundary darkMode={darkMode} t={t}>
            <WorkerManagement darkMode={darkMode} />
          </ErrorBoundary>
        );
      case 'accounting':
        return (
          <ErrorBoundary darkMode={darkMode} t={t}>
            <AccountingManagement darkMode={darkMode} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary darkMode={darkMode} t={t}>
            <DashboardHome darkMode={darkMode} />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <ErrorBoundary darkMode={darkMode} t={t}>
        <Sidebar
          isOpen={sidebarOpen}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          darkMode={darkMode}
        />
      </ErrorBoundary>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className={`p-2 mr-4 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold">
              {currentPage === 'dashboard' ? t('dashboard') :
               currentPage === 'fields' ? t('fields') :
               currentPage === 'rainfall' ? t('rainfall') :
               currentPage === 'fertilizer' ? t('fertilizer') :
               currentPage === 'workers' ? t('workers') :
               currentPage === 'accounting' ? t('accounting') :
               t('dashboard')}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <LanguageSelector />
            <button className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} relative`}>
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-green-700' : 'bg-green-500'} text-white`}>
                <User size={16} />
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-auto p-6 ${darkMode ? 'text-white' : ''}`}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;