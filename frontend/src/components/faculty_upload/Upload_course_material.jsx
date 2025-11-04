import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/auth_context';
import { db, storage } from '../../firebase_config';
import { collection, query, limit, onSnapshot, getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../../context/Theme';

const Upload_course_material = ({ onClose, course, handleCourseClick }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch professor's courses
  useEffect(() => {
    if (user == null) {
      return;
    }

    const Current_user = user.uid;
    const doc_ref = collection(db, "users", Current_user, "enrolled_courses");
    const doc_query = query(doc_ref, limit(50));
    
    const items = onSnapshot(doc_query, async (snapshot) => {
      const coursePromises = snapshot.docs.map(async (docSnap) => {
        const course_ref = doc(db, "courses", docSnap.id);
        try {
          const courseSnapshot = await getDoc(course_ref);
          if (courseSnapshot.exists()) {
            return { id: courseSnapshot.id, ...courseSnapshot.data() };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching course ${docSnap.id}:`, error);
          return null;
        }
      });

      const coursesData = await Promise.all(coursePromises);
      const validCourses = coursesData.filter(course => course !== null);
      setCourses(validCourses);
    });

    return () => {
      items();
    };
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedCourse || !selectedWeek || !selectedFile) {
      alert('Please select a course, week, and file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a unique file name with timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      
      // Create storage reference: materials/{course_id}/week_{week_number}/{filename}
      const storageRef = ref(storage, `materials/${selectedCourse}/week_${selectedWeek}/${fileName}`);
      
      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          // Handle upload error
          console.error('Upload error:', error);
          throw error;
        },
        async () => {
          // Upload completed successfully, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save material metadata to Firestore: materials/{course_id}/weeks/{material_id}
          const materialId = `material_${timestamp}`;
          const materialRef = doc(db, 'materials', selectedCourse, 'weeks', materialId);
          
          await setDoc(materialRef, {
            name: selectedFile.name,
            fileName: fileName,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            downloadURL: downloadURL,
            uploadedBy: user.uid,
            uploadedByName: user.displayName,
            uploadedAt: serverTimestamp(),
            courseId: selectedCourse,
            weekNumber: parseInt(selectedWeek)
          });

          console.log('Upload successful:', {
            course: selectedCourse,
            week: selectedWeek,
            file: selectedFile.name,
            url: downloadURL
          });

          setUploadSuccess(true);
          
          // Refresh the course content if handleCourseClick is provided
          if (handleCourseClick && course) {
            // Trigger a refresh by re-selecting the course
            setTimeout(() => {
              handleCourseClick(course);
            }, 500);
          }
          
          // Reset form and close modal after successful upload
          setTimeout(() => {
            setSelectedCourse('');
            setSelectedWeek('');
            setSelectedFile(null);
            setUploadSuccess(false);
            setUploadProgress(0);
            if (onClose) {
              onClose();
            }
          }, 1500);
        }
      );
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className={`rounded-lg shadow-sm border p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Upload Course Materials</h2>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
            >
              <X className={`w-6 h-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Course Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Select Course <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Week Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Select Week <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            >
              <option value="">Choose a week...</option>
              {[...Array(15)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Week {index + 1}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Upload Document <span className="text-red-500">*</span>
            </label>
            
            {!selectedFile ? (
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${theme === "dark" ? "border-gray-600 hover:border-blue-500" : "border-gray-300 hover:border-blue-400"}`}>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.mov,.avi"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className={`w-12 h-12 mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Click to upload or drag and drop
                  </p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    PDF, DOC, PPT, XLS, TXT, MP4, MOV, AVI (max 100MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className={`border rounded-lg p-4 ${theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className={`w-10 h-10 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                    <div>
                      <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{selectedFile.name}</p>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className={`p-2 rounded-full transition-colors ${theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-200"}`}
                  >
                    <X className={`w-5 h-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleUpload}
              disabled={!selectedCourse || !selectedWeek || !selectedFile || uploading}
              className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold transition-colors ${
                !selectedCourse || !selectedWeek || !selectedFile || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : uploadSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading... {uploadProgress}%
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Upload Successful!
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Material
                </>
              )}
            </button>
            
            {/* Progress Bar */}
            {uploading && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Info Message */}
          <div className={`border rounded-lg p-4 ${theme === "dark" ? "bg-blue-950 border-blue-900" : "bg-blue-50 border-blue-200"}`}>
            <p className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>
              <strong>Note:</strong> Uploaded materials will be immediately available to students enrolled in the selected course.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload_course_material;