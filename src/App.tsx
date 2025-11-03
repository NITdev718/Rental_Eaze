import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import AuthPage from './pages/AuthPage';

type Page = 'home' | 'browse' | 'dashboard' | 'messages' | 'auth';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  function handleNavigate(page: string) {
    setCurrentPage(page as Page);
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          {currentPage !== 'auth' && (
            <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          )}

          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
          {currentPage === 'browse' && <BrowsePage onNavigate={handleNavigate} />}
          {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {currentPage === 'messages' && <MessagesPage onNavigate={handleNavigate} />}
          {currentPage === 'auth' && <AuthPage onNavigate={handleNavigate} />}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
