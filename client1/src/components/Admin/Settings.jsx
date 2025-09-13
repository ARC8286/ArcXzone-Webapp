import React, { useState, useEffect } from 'react';
import { Save, Bell, Globe, Shield, Database, User, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      contentUpdates: true,
      systemAlerts: false
    },
    preferences: {
      language: 'en',
      theme: 'system',
      resultsPerPage: 10
    },
    privacy: {
      dataCollection: true,
      analytics: true,
      showOnlineStatus: true
    }
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch user settings from an API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setLoading(false);
      setSaved(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Icon className="h-5 w-5 text-indigo-600 mr-2" />
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );

  const ToggleSetting = ({ label, description, category, setting, value }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-grow">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
      </div>
      <div className="flex-shrink-0">
        <button
          type="button"
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
          onClick={() => handleSettingChange(category, setting, !value)}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
              value ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      {saved && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-100 px-4 py-3 rounded mb-6">
          Settings saved successfully!
        </div>
      )}

      {/* Profile Section */}
      <Section title="Profile Information" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={user?.name || ''}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={user?.email || ''}
              disabled
            />
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          Edit Profile
        </button>
      </Section>

      {/* Notification Settings */}
      <Section title="Notification Preferences" icon={Bell}>
        <ToggleSetting
          label="Email Notifications"
          description="Receive important updates via email"
          category="notifications"
          setting="email"
          value={settings.notifications.email}
        />
        <ToggleSetting
          label="Content Updates"
          description="Get notified when new content is added"
          category="notifications"
          setting="contentUpdates"
          value={settings.notifications.contentUpdates}
        />
        <ToggleSetting
          label="System Alerts"
          description="Receive system maintenance alerts"
          category="notifications"
          setting="systemAlerts"
          value={settings.notifications.systemAlerts}
        />
      </Section>

      {/* Application Preferences */}
      <Section title="Application Preferences" icon={Globe}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <select
            value={settings.preferences.language}
            onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Theme
          </label>
          <select
            value={settings.preferences.theme}
            onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Results Per Page
          </label>
          <select
            value={settings.preferences.resultsPerPage}
            onChange={(e) => handleSettingChange('preferences', 'resultsPerPage', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </Section>

      {/* Privacy & Data */}
      <Section title="Privacy & Data" icon={Shield}>
        <ToggleSetting
          label="Data Collection"
          description="Allow us to collect anonymous usage data to improve our service"
          category="privacy"
          setting="dataCollection"
          value={settings.privacy.dataCollection}
        />
        <ToggleSetting
          label="Analytics"
          description="Help us understand how you use our platform"
          category="privacy"
          setting="analytics"
          value={settings.privacy.analytics}
        />
        <ToggleSetting
          label="Show Online Status"
          description="Allow others to see when you're active"
          category="privacy"
          setting="showOnlineStatus"
          value={settings.privacy.showOnlineStatus}
        />
      </Section>

      {/* Data Management */}
      <Section title="Data Management" icon={Database}>
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Export Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Download a copy of your data for backup or transfer purposes.
          </p>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Export My Data
          </button>
        </div>
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Delete Account</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          <Save size={16} className="mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;