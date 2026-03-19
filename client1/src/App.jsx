// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import AdminPanel from './pages/AdminPanel';
import HomePage from './pages/HomePage';
import ContentPage from './pages/ContentPage';
import ViewAllPage from './pages/ViewAllPage';
import Login from './pages/Login';
import RequestPage from './pages/RequestPage';
import Navbar from './components/Common/Navbar';
import ProtectedRoute from './components/Common/ProtectedRoute';
import SearchProvider from './contexts/SearchContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <Router>
            <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/content/:id" element={<ContentPage />} />
                <Route path="/content" element={<ViewAllPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/request-content" element={<RequestPage />} />
                
                {/* Admin Routes with Protection */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={
                  <div className="flex items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                      404 - Page Not Found
                    </h1>
                  </div>
                } />
              </Routes>
            </div>
          </Router>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;