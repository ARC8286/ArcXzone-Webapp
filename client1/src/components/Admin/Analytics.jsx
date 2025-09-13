import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Eye, 
  Calendar,
  Film,
  Tv,
  Activity,
  TrendingUp
} from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAnalytics({ period });
      setAnalyticsData(response.data);
    } catch (error) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const prepareTimeSeriesData = () => {
    if (!analyticsData?.aggregatedData) return { labels: [], datasets: [] };
    
    const viewsData = {};
    const downloadsData = {};
    
    analyticsData.aggregatedData.forEach(item => {
      if (item._id.type === 'view') {
        viewsData[item._id.date] = item.total;
      } else if (item._id.type === 'download') {
        downloadsData[item._id.date] = item.total;
      }
    });
    
    const labels = Object.keys(viewsData).sort();
    
    return {
      labels,
      datasets: [
        {
          label: 'Views',
          data: labels.map(date => viewsData[date] || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
        },
        {
          label: 'Downloads',
          data: labels.map(date => downloadsData[date] || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2,
        },
      ],
    };
  };

  const prepareContentTypeData = () => {
    if (!analyticsData?.topContent) return { labels: [], datasets: [] };
    
    const typeCounts = {
      movie: { views: 0, downloads: 0 },
      webseries: { views: 0, downloads: 0 },
      anime: { views: 0, downloads: 0 },
    };
    
    analyticsData.topContent.forEach(item => {
      if (typeCounts[item.type]) {
        typeCounts[item.type].views += item.views;
        typeCounts[item.type].downloads += item.downloads;
      }
    });
    
    return {
      labels: ['Movies', 'Web Series', 'Anime'],
      datasets: [
        {
          label: 'Views',
          data: [
            typeCounts.movie.views,
            typeCounts.webseries.views,
            typeCounts.anime.views,
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Downloads',
          data: [
            typeCounts.movie.downloads,
            typeCounts.webseries.downloads,
            typeCounts.anime.downloads,
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
  };

  const timeSeriesData = prepareTimeSeriesData();
  const contentTypeData = prepareContentTypeData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
          <BarChart3 className="mr-2" />
          Analytics Dashboard
        </h1>
        
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analyticsData.aggregatedData
                  .filter(item => item._id.type === 'view')
                  .reduce((sum, item) => sum + item.total, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Downloads</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analyticsData.aggregatedData
                  .filter(item => item._id.type === 'download')
                  .reduce((sum, item) => sum + item.total, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <Film className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Movies</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analyticsData.topContent
                  .filter(item => item.type === 'movie')
                  .reduce((sum, item) => sum + item.views + item.downloads, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Activity className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Anime</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analyticsData.topContent
                  .filter(item => item.type === 'anime')
                  .reduce((sum, item) => sum + item.views + item.downloads, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="mr-2" />
            Views & Downloads Over Time
          </h2>
          <div className="h-80">
            <Line data={timeSeriesData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content Type Distribution
          </h2>
          <div className="h-80">
            <Bar data={contentTypeData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top Content Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Performing Content
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analyticsData.topContent.map((item) => (
                <tr key={item.contentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.downloads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                    {item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;