// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { contentAPI } from '../../services/api';
import { Film, Tv, Activity, Users } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    movies: 0,
    webseries: 0,
    anime: 0,
    total: 0
  });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movies, webseries, anime, allContent] = await Promise.all([
          contentAPI.getAll({ type: 'movie', limit: 1 }),
          contentAPI.getAll({ type: 'webseries', limit: 1 }),
          contentAPI.getAll({ type: 'anime', limit: 1 }),
          contentAPI.getAll({ limit: 5, sort: '-createdAt' })
        ]);

        setStats({
          movies: movies.data.total,
          webseries: webseries.data.total,
          anime: anime.data.total,
          total: movies.data.total + webseries.data.total + anime.data.total
        });

        setRecentContent(allContent.data.contents);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Content"
          value={stats.total}
          icon={Film}
          color="text-indigo-600"
        />
        <StatCard
          title="Movies"
          value={stats.movies}
          icon={Film}
          color="text-green-600"
        />
        <StatCard
          title="Web Series"
          value={stats.webseries}
          icon={Tv}
          color="text-yellow-600"
        />
        <StatCard
          title="Anime"
          value={stats.anime}
          icon={Activity}
          color="text-red-600"
        />
      </div>

      {/* Recent Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recent Content
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentContent.map((content) => (
              <li key={content._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={content.posterUrl}
                        alt={content.title}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {content.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {content.type} • {new Date(content.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100">
                      {content.rating || 'N/A'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;