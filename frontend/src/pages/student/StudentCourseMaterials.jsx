import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, BookOpen, Download, FileText, Video, File, Calendar, User as UserIcon, Clock, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/Theme';
import { db } from '../../firebase_config';
import { collection, query, getDocs } from 'firebase/firestore';

const StudentCourseMaterials = ({ course, onBack }) => {
  const { theme } = useTheme();
  const [weeklyMaterials, setWeeklyMaterials] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Toggle week handler
  const handleWeekToggle = useCallback((weekNumber) => {
    setSelectedWeek(prev => prev === weekNumber ? null : weekNumber);
  }, []);

  // Fetch materials from Firestore
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!course || !course.id) return;
      
      setLoading(true);
      try {
        // Fetch all materials for this course
        const weeksRef = collection(db, 'materials', course.id, 'weeks');
        const weeksQuery = query(weeksRef);
        const weeksSnapshot = await getDocs(weeksQuery);
        
        // Group materials by week number
        const materialsData = {};
        weeksSnapshot.docs.forEach(doc => {
          const material = { id: doc.id, ...doc.data() };
          const weekNum = material.weekNumber;
          
          if (!materialsData[weekNum]) {
            materialsData[weekNum] = [];
          }
          materialsData[weekNum].push(material);
        });
        
        setWeeklyMaterials(materialsData);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [course]);

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-6 h-6 text-gray-400" />;
    
    if (fileType.includes('pdf')) {
      return <FileText className="w-6 h-6 text-red-500" />;
    } else if (fileType.includes('video') || fileType.includes('mp4') || fileType.includes('mov')) {
      return <Video className="w-6 h-6 text-purple-500" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="w-6 h-6 text-orange-500" />;
    } else {
      return <File className="w-6 h-6 text-gray-400" />;
    }
  };
  
  const handleDownload = (material) => {
    if (material.downloadURL) {
      window.open(material.downloadURL, '_blank');
    }
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>No course selected</p>
      </div>
    );
  }

  // Calculate total materials
  const totalMaterials = Object.values(weeklyMaterials).reduce((sum, materials) => sum + materials.length, 0);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className={`rounded-xl shadow-lg border p-6 ${theme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" : "bg-gradient-to-br from-white to-gray-50 border-gray-200"}`}>
        {/* Back button removed */}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-xl ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"}`}>
                <BookOpen className={`w-8 h-8 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {course.name}
                </h1>
                <p className={`text-lg font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                  {course.code}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700/50" : "bg-white"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <UserIcon className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Professor</span>
                </div>
                <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {course.professor || 'N/A'}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700/50" : "bg-white"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Schedule</span>
                </div>
                <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {course.schedule || 'N/A'}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700/50" : "bg-white"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Credits</span>
                </div>
                <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {course.credits || 'N/A'}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700/50" : "bg-white"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Materials</span>
                </div>
                <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {totalMaterials} files
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Materials Grid */}
      <div>
        <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Course Materials by Week
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className={`ml-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Loading materials...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ gridAutoRows: 'auto' }}>
            {[...Array(15)].map((_, index) => {
              const weekNumber = index + 1;
              const materials = weeklyMaterials[weekNumber] || [];

              return (
                <div
                  key={weekNumber}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (materials.length > 0) {
                      handleWeekToggle(weekNumber);
                    }
                  }}
                  className={`rounded-xl border-2 transition-all duration-300 self-start ${
                    materials.length > 0 ? 'cursor-pointer' : 'opacity-50'
                  } ${
                    selectedWeek === weekNumber
                      ? theme === "dark"
                        ? "border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/20"
                        : "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20"
                      : theme === "dark"
                      ? "border-gray-700 bg-gray-800 hover:border-gray-600 hover:shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                          materials.length > 0
                            ? theme === "dark"
                              ? "bg-blue-900/50 text-blue-400"
                              : "bg-blue-100 text-blue-600"
                            : theme === "dark"
                            ? "bg-gray-700 text-gray-500"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {weekNumber}
                        </div>
                        <div>
                          <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            Week {weekNumber}
                          </h3>
                          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {materials.length} {materials.length === 1 ? 'file' : 'files'}
                          </p>
                        </div>
                      </div>
                      {materials.length > 0 && (
                        <ChevronRight className={`w-5 h-5 transition-transform ${
                          selectedWeek === weekNumber ? 'rotate-90' : ''
                        } ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                      )}
                    </div>

                    {/* Expanded Materials */}
                    {selectedWeek === weekNumber && materials.length > 0 && (
                      <div className="mt-4 space-y-2 border-t pt-4" style={{
                        borderColor: theme === "dark" ? "#374151" : "#e5e7eb"
                      }}>
                        {materials.map((material) => (
                          <div
                            key={material.id}
                            onClick={(e) => e.stopPropagation()}
                            className={`p-3 rounded-lg transition-all ${
                              theme === "dark"
                                ? "bg-gray-700/50 hover:bg-gray-700"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getFileIcon(material.fileType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                  {material.name}
                                </p>
                                <div className={`flex items-center gap-3 mt-1 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(material.uploadedAt)}
                                  </span>
                                  <span>{formatFileSize(material.fileSize)}</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(material);
                                }}
                                className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                                  theme === "dark"
                                    ? "bg-blue-900/50 text-blue-400 hover:bg-blue-900"
                                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                }`}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalMaterials === 0 && (
          <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
            theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
          }`}>
            <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
            <p className={`text-lg font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              No materials available yet
            </p>
            <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              Your professor hasn't uploaded any materials for this course.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseMaterials;
