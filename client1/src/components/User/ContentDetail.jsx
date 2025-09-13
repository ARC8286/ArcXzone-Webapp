// // src/components/User/ContentDetail.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { 
//   Calendar, 
//   Clock, 
//   Star, 
//   Download, 
//   Globe, 
//   HardDrive,
//   ArrowLeft,
//   Play
// } from 'lucide-react';
// import { contentAPI } from '../../services/api';

// const ContentDetail = () => {
//   const { id } = useParams();
//   const [content, setContent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('download');

//   useEffect(() => {
//     const fetchContent = async () => {
//       try {
//         const response = await contentAPI.getById(id);
//         setContent(response.data);
//       } catch (err) {
//         setError('Content not found');
//         console.error('Error fetching content:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchContent();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !content) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="text-center text-red-600 dark:text-red-400 text-xl">
//             {error || 'Content not found'}
//           </div>
//           <div className="text-center mt-4">
//             <Link
//               to="/"
//               className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
//             >
//               <ArrowLeft size={16} className="mr-2" />
//               Back to Home
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatRuntime = (minutes) => {
//     if (!minutes) return 'N/A';
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
//   };

//   const getSourceIcon = (sourceType) => {
//     switch (sourceType) {
//       case 'TelegramBot':
//         return <Globe size={16} className="mr-1" />;
//       case 'SelfHosted':
//         return <HardDrive size={16} className="mr-1" />;
//       default:
//         return <Play size={16} className="mr-1" />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
//       {/* Hero Section */}
//       <div 
//         className="relative h-96 bg-cover bg-center bg-no-repeat"
//         style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), url(${content.backdropUrl || content.posterUrl})` }}
//       >
//         <div className="absolute inset-0 bg-black bg-opacity-50"></div>
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
//           <div className="text-white">
//             <Link
//               to="/"
//               className="inline-flex items-center text-white hover:text-gray-200 mb-4"
//             >
//               <ArrowLeft size={20} className="mr-2" />
//               Back to Home
//             </Link>
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
//             <div className="flex flex-wrap items-center gap-4 text-sm">
//               <span className="bg-indigo-600 px-3 py-1 rounded-full capitalize">
//                 {content.type}
//               </span>
//               <div className="flex items-center">
//                 <Calendar size={16} className="mr-1" />
//                 {formatDate(content.releaseDate)}
//               </div>
//               {content.runtime && (
//                 <div className="flex items-center">
//                   <Clock size={16} className="mr-1" />
//                   {formatRuntime(content.runtime)}
//                 </div>
//               )}
//               <div className="flex items-center">
//                 <Star size={16} className="text-yellow-400 mr-1" />
//                 {content.rating || 'N/A'}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content Details */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Poster and Basic Info */}
//           <div className="lg:col-span-1">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
//               <img
//                 src={content.posterUrl}
//                 alt={content.title}
//                 className="w-full h-auto object-cover"
//               />
//               <div className="p-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 text-sm rounded-full capitalize">
//                     {content.type}
//                   </span>
//                   <div className="flex items-center text-yellow-500">
//                     <Star size={16} className="mr-1" />
//                     <span className="font-semibold">{content.rating || 'N/A'}</span>
//                   </div>
//                 </div>

//                 <div className="space-y-2 text-sm">
//                   <div>
//                     <span className="font-medium text-gray-600 dark:text-gray-400">Released:</span>
//                     <span className="ml-2 text-gray-900 dark:text-white">
//                       {formatDate(content.releaseDate)}
//                     </span>
//                   </div>
//                   {content.runtime && (
//                     <div>
//                       <span className="font-medium text-gray-600 dark:text-gray-400">Runtime:</span>
//                       <span className="ml-2 text-gray-900 dark:text-white">
//                         {formatRuntime(content.runtime)}
//                       </span>
//                     </div>
//                   )}
//                   {content.director && (
//                     <div>
//                       <span className="font-medium text-gray-600 dark:text-gray-400">Director:</span>
//                       <span className="ml-2 text-gray-900 dark:text-white">{content.director}</span>
//                     </div>
//                   )}
//                 </div>

//                 {content.genres && content.genres.length > 0 && (
//                   <div className="mt-4">
//                     <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Genres</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {content.genres.map((genre, index) => (
//                         <span
//                           key={index}
//                           className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded"
//                         >
//                           {genre}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Details and Download Options */}
//           <div className="lg:col-span-2">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//               {/* Tabs */}
//               <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
//                 <nav className="-mb-px flex space-x-8">
//                   <button
//                     onClick={() => setActiveTab('details')}
//                     className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                       activeTab === 'details'
//                         ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
//                         : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                     }`}
//                   >
//                     Details
//                   </button>
//                   <button
//                     onClick={() => setActiveTab('download')}
//                     className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                       activeTab === 'download'
//                         ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
//                         : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                     }`}
//                   >
//                     Download Options
//                   </button>
//                 </nav>
//               </div>

//               {/* Details Tab */}
//               {activeTab === 'details' && (
//                 <div className="space-y-6">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//                       Synopsis
//                     </h2>
//                     <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
//                       {content.description}
//                     </p>
//                   </div>

//                   {content.cast && content.cast.length > 0 && (
//                     <div>
//                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
//                         Cast
//                       </h3>
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                         {content.cast.map((actor, index) => (
//                           <div
//                             key={index}
//                             className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
//                           >
//                             <span className="text-sm text-gray-900 dark:text-white">{actor}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {content.tags && content.tags.length > 0 && (
//                     <div>
//                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
//                         Tags
//                       </h3>
//                       <div className="flex flex-wrap gap-2">
//                         {content.tags.map((tag, index) => (
//                           <span
//                             key={index}
//                             className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 text-sm rounded-full"
//                           >
//                             {tag}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Download Tab */}
//               {activeTab === 'download' && (
//                 <div>
//                   {content.availability && content.availability.length > 0 ? (
//                     <div className="space-y-4">
//                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//                         Available Downloads
//                       </h3>
//                       {content.availability.map((option, index) => (
//                         <div
//                           key={index}
//                           className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                         >
//                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                             <div className="flex-1">
//                               <h4 className="font-medium text-gray-900 dark:text-white">
//                                 {option.label}
//                               </h4>
//                               <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
//                                 {getSourceIcon(option.sourceType)}
//                                 <span className="capitalize">{option.sourceType}</span>
//                                 {option.quality && (
//                                   <>
//                                     <span className="mx-2">•</span>
//                                     <span>{option.quality}</span>
//                                   </>
//                                 )}
//                                 {option.size && (
//                                   <>
//                                     <span className="mx-2">•</span>
//                                     <span>{option.size}</span>
//                                   </>
//                                 )}
//                                 {option.region && (
//                                   <>
//                                     <span className="mx-2">•</span>
//                                     <span>{option.region}</span>
//                                   </>
//                                 )}
//                               </div>
//                               {option.licenseNote && (
//                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                                   {option.licenseNote}
//                                 </p>
//                               )}
//                             </div>
//                             <a
//                               href={option.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
//                             >
//                               <Download size={16} className="mr-2" />
//                               Download
//                             </a>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                       <Download size={48} className="mx-auto mb-4 opacity-50" />
//                       <p>No download options available for this content.</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContentDetail;