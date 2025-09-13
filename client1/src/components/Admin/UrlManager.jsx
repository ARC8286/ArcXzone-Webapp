// src/components/Admin/UrlManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import { contentAPI, availabilityAPI } from '../../services/api';
import { RefreshCw, Search, Globe, Download, Save, AlertCircle, ExternalLink, Pause, Play } from 'lucide-react';

const UrlManager = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('https://t.me/ArcXzone2_bot');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [results, setResults] = useState([]);
  const [affectedCount, setAffectedCount] = useState(0);
  const [previewMode, setPreviewMode] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [estimatedTime, setEstimatedTime] = useState('Calculating...');
  const processingRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  // Function to replace only the bot URL part while preserving query parameters
  const replaceBotUrl = (originalUrl, oldBotUrl, newBotUrl) => {
    if (!originalUrl.includes(oldBotUrl)) return originalUrl;
    
    // Split the URL to preserve query parameters
    const [baseUrl, queryParams] = originalUrl.split('?');
    
    // Replace only the bot URL part in the base URL
    const newBaseUrl = baseUrl.replace(oldBotUrl, newBotUrl);
    
    // Reconstruct the URL with query parameters if they exist
    return queryParams ? `${newBaseUrl}?${queryParams}` : newBaseUrl;
  };

  // Function to delay execution
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Function to retry a failed request with exponential backoff
  const retryWithBackoff = async (operation, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (error.response?.status === 429 && i < maxRetries - 1) {
          // If rate limited, wait with exponential backoff
          const delayTime = baseDelay * Math.pow(2, i);
          console.log(`Rate limited. Retrying in ${delayTime}ms...`);
          await delay(delayTime);
        } else {
          throw error;
        }
      }
    }
  };

  // Main search function
  const searchUrls = async (isManualSearch = false) => {
    if (!searchTerm) return;
    
    if (processingRef.current) return;
    processingRef.current = true;
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // Get all content with pagination if supported by your backend
      let allContent = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 50;
      
      // Clear previous timeout if it's a manual search
      if (isManualSearch && searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      while (hasMore && !isPaused) {
        try {
          const contentResponse = await contentAPI.getAll({ 
            limit: pageSize, 
            page: page 
          });
          
          const contentData = contentResponse.data.contents || contentResponse.data || [];
          allContent = [...allContent, ...contentData];
          
          // Check if there are more pages (adapt this based on your API response)
          hasMore = contentResponse.data.hasNextPage || 
                   contentResponse.data.totalPages > page ||
                   contentData.length === pageSize;
          
          page++;
          
          // Add delay between pages to avoid rate limiting
          await delay(300);
        } catch (error) {
          console.error('Error fetching content page:', error);
          // Continue with what we have
          hasMore = false;
        }
      }
      
      // Get all availability options
      let allAvailabilities = [];
      
      // Process content in smaller batches to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < allContent.length; i += batchSize) {
        if (isPaused) break;
        
        const batch = allContent.slice(i, i + batchSize);
        
        // Process each content item in the batch
        const batchPromises = batch.map(async (content) => {
          try {
            const availResponse = await availabilityAPI.getByContentId(content._id);
            if (availResponse.data && availResponse.data.length > 0) {
              return availResponse.data.map(avail => ({
                ...avail,
                contentId: content._id,
                contentTitle: content.title,
                contentSlug: content.slug,
                contentType: content.type
              }));
            }
            return [];
          } catch (error) {
            console.error(`Error fetching availabilities for ${content.title}:`, error);
            return [];
          }
        });
        
        // Wait for all batch promises to resolve
        const batchResults = await Promise.all(batchPromises);
        
        // Flatten the results and add to allAvailabilities
        batchResults.forEach(availabilities => {
          allAvailabilities = [...allAvailabilities, ...availabilities];
        });

        // Add a small delay between batches to avoid rate limiting
        await delay(500);
        
        // Update progress for large datasets
        if (allContent.length > 1000) {
          setMessage({ 
            type: 'info', 
            text: `Processed ${Math.min(i + batchSize, allContent.length)} of ${allContent.length} content items...` 
          });
        }
      }
      
      // Filter availability options that contain the search term
      const matchingAvailabilities = allAvailabilities.filter(avail => 
        avail.url && avail.url.includes(searchTerm)
      );
      
      setResults(matchingAvailabilities);
      setAffectedCount(matchingAvailabilities.length);
      
      if (matchingAvailabilities.length === 0) {
        setMessage({ type: 'info', text: 'No URLs found matching your search' });
      } else {
        setMessage({ type: 'success', text: `Found ${matchingAvailabilities.length} URLs matching your search` });
        
        // Calculate estimated time
        const estimatedSeconds = Math.ceil(matchingAvailabilities.length * 0.8 / 60);
        setEstimatedTime(`~${estimatedSeconds} minute${estimatedSeconds !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error searching URLs:', error);
      setMessage({ type: 'error', text: 'Failed to search URLs. Please try again.' });
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  };

  // Manual search button handler
  const handleManualSearch = () => {
    // Clear any pending automatic search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // Perform search immediately
    searchUrls(true);
  };

  // Replace URLs across all content with rate limiting protection
  const replaceUrls = async () => {
    if (!searchTerm || !replaceTerm) {
      setMessage({ type: 'error', text: 'Both search and replace terms are required' });
      return;
    }
    
    if (searchTerm === replaceTerm) {
      setMessage({ type: 'error', text: 'Search and replace terms cannot be the same' });
      return;
    }
    
    if (processingRef.current) return;
    processingRef.current = true;
    
    try {
      setLoading(true);
      setIsPaused(false);
      setMessage({ type: '', text: '' });
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // Set up progress tracking
      setProgress({ current: 0, total: results.length });
      
      // Process each result with delays to avoid rate limiting
      for (let i = 0; i < results.length; i++) {
        // Check if paused
        while (isPaused && processingRef.current) {
          await delay(500);
        }
        
        if (!processingRef.current) break;
        
        const item = results[i];
        
        try {
          // Use the custom function to replace only the bot URL part
          const newUrl = replaceBotUrl(item.url, searchTerm, replaceTerm);
          
          // Prepare update data (only include fields that can be updated)
          const updateData = {
            label: item.label,
            quality: item.quality,
            language: item.language,
            size: item.size,
            sourceType: item.sourceType,
            url: newUrl,
            region: item.region,
            licenseNote: item.licenseNote
          };
          
          // Use retry with backoff for the update operation
          await retryWithBackoff(async () => {
            await availabilityAPI.update(
              item.contentId,
              item._id,
              updateData
            );
          });
          
          successCount++;
        } catch (error) {
          console.error(`Error updating URL for ${item.contentTitle}:`, error);
          errors.push({
            content: item.contentTitle,
            error: error.response?.data?.message || 'Unknown error'
          });
          errorCount++;
        }
        
        // Update progress
        setProgress({ current: i + 1, total: results.length });
        
        // Calculate and update estimated time remaining
        const remaining = results.length - (i + 1);
        const estimatedSeconds = Math.ceil(remaining * 0.8 / 60);
        setEstimatedTime(`~${estimatedSeconds} minute${estimatedSeconds !== 1 ? 's' : ''} remaining`);
        
        // Add a delay between requests to avoid rate limiting
        // Longer delay for large datasets to prevent server overload
        const delayTime = results.length > 1000 ? 1000 : 800;
        await delay(delayTime);
      }
      
      if (errorCount > 0) {
        setMessage({ 
          type: 'warning', 
          text: `Updated ${successCount} URLs successfully. ${errorCount} failed. ${errors.length > 0 ? `First error: ${errors[0].content} - ${errors[0].error}` : ''}` 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: `Updated ${successCount} URLs successfully.` 
        });
      }
      
      // Refresh the search results
      if (successCount > 0) {
        setTimeout(() => {
          searchUrls(true);
        }, 1500);
      }
    } catch (error) {
      console.error('Error replacing URLs:', error);
      setMessage({ type: 'error', text: 'Failed to replace URLs. Please try again.' });
    } finally {
      setLoading(false);
      setIsPaused(false);
      setProgress({ current: 0, total: 0 });
      setEstimatedTime('Calculating...');
      processingRef.current = false;
    }
  };

  // Cancel operation
  const cancelOperation = () => {
    processingRef.current = false;
    setIsPaused(false);
    setLoading(false);
    setMessage({ type: 'info', text: 'Operation cancelled' });
  };

  // Test a URL to see if it's accessible
  const testUrl = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Generate preview URL for display
  const getPreviewUrl = (originalUrl) => {
    if (!replaceTerm) return '—';
    return replaceBotUrl(originalUrl, searchTerm, replaceTerm);
  };

  // Toggle pause/resume
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      processingRef.current = false;
    };
  }, []);

  // Handle live search with debouncing
  useEffect(() => {
    if (searchTerm && previewMode) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for live search
      searchTimeoutRef.current = setTimeout(() => {
        searchUrls(false);
      }, 1000);
      
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }
  }, [searchTerm, previewMode]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Telegram Bot URL Manager
      </h1>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Search Instructions
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                • Type in the search field for <strong>live search</strong> (automatic after 1 second)
              </p>
              <p>
                • Click the <strong>Search button</strong> for immediate manual search
              </p>
              <p>
                • Both methods should return the same results
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'error' 
            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100' 
            : message.type === 'warning'
            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100'
            : message.type === 'success'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'
            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Bot URL *
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://t.me/ArcXzone2_bot"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The current bot URL to be replaced
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Bot URL *
            </label>
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://t.me/NewBotName_bot"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The new bot URL to replace with
            </p>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={previewMode}
              onChange={() => setPreviewMode(!previewMode)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
            />
            Live preview (automatically search as you type)
          </label>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleManualSearch}
            disabled={loading || !searchTerm}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Search size={16} className="mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </button>
          
          <button
            onClick={replaceUrls}
            disabled={loading || !searchTerm || !replaceTerm || affectedCount === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Save size={16} className="mr-2" />
            Replace All ({affectedCount})
          </button>
          
          {loading && (
            <>
              <button
                onClick={togglePause}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isPaused ? <Play size={16} className="mr-2" /> : <Pause size={16} className="mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              
              <button
                onClick={cancelOperation}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <RefreshCw size={16} className="mr-2" />
                Cancel
              </button>
            </>
          )}
          
          <button
            onClick={() => {
              setSearchTerm('https://t.me/ArcXzone2_bot');
              setReplaceTerm('');
            }}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <RefreshCw size={16} className="mr-2" />
            Reset
          </button>
        </div>
        
        {progress.total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress: {progress.current} of {progress.total}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Estimated time: {estimatedTime}
            </div>
          </div>
        )}
        
        {affectedCount > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              <AlertCircle size={16} className="inline mr-1" />
              Found {affectedCount} URL{affectedCount !== 1 ? 's' : ''} that will be updated.
              {affectedCount > 1000 && ' This may take several minutes.'}
            </p>
            {affectedCount > 100 && (
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                Note: Only first 100 results are displayed, but all {affectedCount} will be processed.
              </p>
            )}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {progress.total > 0 ? 'Processing URLs...' : 'Searching URLs across all content...'}
          </p>
          {progress.total > 1000 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Processing large dataset. This may take a while. You can pause or cancel at any time.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Affected URLs ({affectedCount})
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              These Telegram bot URLs will be updated when you click "Replace All"
            </p>
            {affectedCount > 100 && (
              <p className="mt-1 text-sm text-blue-500 dark:text-blue-400">
                Showing first 100 of {affectedCount} results. All {affectedCount} will be processed.
              </p>
            )}
          </div>
          
          {affectedCount > 0 ? (
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Availability Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      New URL
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {results.slice(0, 100).map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.contentTitle}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {item.contentType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.language} • {item.quality || 'N/A'} • {item.sourceType}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400">
                        <div className="truncate max-w-xs">{item.url}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400">
                        <div className="truncate max-w-xs">
                          {getPreviewUrl(item.url)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => testUrl(item.url)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                          title="Test current URL"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length > 100 && (
                <div className="p-4 text-center bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing first 100 of {results.length} results. All {results.length} URLs will be processed.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No Telegram bot URLs found matching your search</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try a different search term or check if the URL exists in your content.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UrlManager;