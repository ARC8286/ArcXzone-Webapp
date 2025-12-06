// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  List,
  Globe,
  Inbox,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Admin/AdminDashboard';
import ContentForm from '../components/Admin/ContentForm';
import ContentList from '../components/Admin/ContentList';
import UrlManager from '../components/Admin/UrlManager';
import RequestManager from '../components/Admin/RequestManager';

const AdminPanel = () => {
  const { logout } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Add Content', href: '/admin/add-content', icon: Plus },
    { name: 'Manage Content', href: '/admin/content', icon: List },
    { name: 'Request Manager', href: '/admin/requests', icon: Inbox },
    { name: 'URL Manager', href: '/admin/url-manager', icon: Globe },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-100'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={logout}
              className="flex-shrink-0 w-full group flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-content" element={<ContentForm />} />
                <Route path="/content" element={<ContentList />} />
                <Route path="/edit-content/:id" element={<ContentForm />} />
                <Route path="/requests" element={<RequestManager />} />
                <Route path="/url-manager" element={<UrlManager />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;