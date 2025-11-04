import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Upload, FileText, Video, File, Download } from 'lucide-react';
import Upload_course_material from './Upload_course_material';
import { useTheme } from '../../context/Theme';
import { db } from '../../firebase_config';
import { collection, query, getDocs } from 'firebase/firestore';

const Course_content = ({ course, handleCourseClick }) => {
  const { theme } = useTheme();
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [weeklyMaterials, setWeeklyMaterials] = useState({});
  const [loading, setLoading] = useState(true);

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
        console.error('Error details:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [course]);

  const toggleWeek = (weekNumber) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-5 h-5 text-gray-600" />;
    
    if (fileType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else if (fileType.includes('video') || fileType.includes('mp4') || fileType.includes('mov')) {
      return <Video className="w-5 h-5 text-purple-600" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="w-5 h-5 text-orange-600" />;
    } else {
      return <File className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const handleDownload = (material) => {
    if (material.downloadURL) {
      window.open(material.downloadURL, '_blank');
    }
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle regular Date or string
    return new Date(timestamp).toLocaleDateString();
  };

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No course selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className={`rounded-lg shadow-sm border p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{course.name}</h1>
            <p className={`text-lg font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>{course.code}</p>
          </div>
          <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
            {course.credits} Credits
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Professor</p>
              <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{course.professor}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Schedule</p>
              <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{course.schedule}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Materials Button */}
      <div className={`rounded-lg shadow-sm border p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Upload Course Materials
        </button>
      </div>

      {/* Weekly Materials */}
      <div className={`rounded-lg shadow-sm border p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Course Materials by Week</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className={`ml-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Loading materials...</span>
          </div>
        ) : (
        <div className="space-y-3">
          {[...Array(15)].map((_, index) => {
            const weekNumber = index + 1;
            const materials = weeklyMaterials[weekNumber] || [];
            const isExpanded = expandedWeek === weekNumber;

            return (
              <div key={weekNumber} className={`border rounded-lg overflow-hidden ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                {/* Week Header */}
                <button
                  onClick={() => toggleWeek(weekNumber)}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Week {weekNumber}</span>
                    {materials.length > 0 && (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
                        {materials.length} {materials.length === 1 ? 'file' : 'files'}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className={`w-5 h-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                  )}
                </button>

                {/* Week Content */}
                {isExpanded && (
                  <div className={`p-4 border-t ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    {materials.length === 0 ? (
                      <p className={`text-sm text-center py-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        No materials uploaded for this week yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {materials.map((material) => (
                          <div
                            key={material.id}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"}`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {getFileIcon(material.fileType)}
                              <div className="flex-1">
                                <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{material.name}</p>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                  Uploaded on {formatDate(material.uploadedAt)}
                                  {material.uploadedByName && ` by ${material.uploadedByName}`}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDownload(material)}
                              className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded transition-colors ${theme === "dark" ? "text-blue-400 hover:bg-gray-600" : "text-blue-600 hover:bg-blue-50"}`}
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Upload Materials Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <Upload_course_material course={course} handleCourseClick={handleCourseClick} onClose={() => setIsUploadModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Course_content;