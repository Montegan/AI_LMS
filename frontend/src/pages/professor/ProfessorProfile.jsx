import { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Edit3, Save, X, Camera, Upload, BookOpen, Users, Calendar } from 'lucide-react';
import { mockProfessor, professorCourses } from '../data/mockData';
import { useTheme } from '../../context/Theme';

export default function ProfessorProfile() {
  const [professorData, setProfessorData] = useState(mockProfessor);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempProfilePic, setTempProfilePic] = useState(null);
  const [tempPhone, setTempPhone] = useState(professorData.phone);
  const [tempAddress, setTempAddress] = useState(professorData.address);
  const fileInputRef = useRef(null);

  const handleProfilePicChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempProfilePic(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfilePicture = () => {
    if (tempProfilePic) {
      setProfessorData(prev => ({
        ...prev,
        profilePic: tempProfilePic
      }));
    }
    setTempProfilePic(null);
    setIsEditingProfile(false);
  };

  const cancelProfilePicture = () => {
    setTempProfilePic(null);
    setIsEditingProfile(false);
  };

  const saveContactInfo = () => {
    setProfessorData(prev => ({
      ...prev,
      phone: tempPhone,
      address: tempAddress
    }));
    setIsEditingContact(false);
  };

  const cancelContactEdit = () => {
    setTempPhone(professorData.phone);
    setTempAddress(professorData.address);
    setIsEditingContact(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const totalStudents = professorCourses.reduce((sum, course) => sum + course.enrolledStudents, 0);
  const activeCourses = professorCourses.length;
  const { theme } = useTheme();

  return (
    <div className={`space-y-6 `}>
      {/* Main Profile Card */}
      <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`p-6 text-center ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
          <div className="flex justify-center mb-4 relative">
            <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
              {(tempProfilePic || professorData.profilePic) ? (
                <img 
                  src={tempProfilePic || professorData.profilePic || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                  alt={professorData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(professorData.name)}</span>
              )}
            </div>
            <button
              onClick={() => setIsEditingProfile(true)}
              className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 flex items-center justify-center border ${theme === "dark" ? "bg-gray-700 border-gray-600 hover:bg-gray-600" : "bg-white border-gray-300 hover:bg-gray-50"}`}
            >
              <Camera className={`w-4 h-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
            </button>
          </div>
          <h3 className={`text-xl font-bold flex items-center justify-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {professorData.name}
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${theme === "dark" ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
              <GraduationCap className="w-3 h-3" />
              Professor
            </span>
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <User className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Professor ID</p>
                <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{professorData.id}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <Mail className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Email</p>
                <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{professorData.email}</p>
              </div>
            </div>
            
            <div className={`flex items-center justify-between gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <div className="flex items-center gap-3 flex-1">
                <Phone className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                <div className="flex-1">
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Phone</p>
                  <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{professorData.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingContact(true)}
                className={`px-3 py-1 border rounded-md flex items-center gap-1 ${theme === "dark" ? "border-gray-600 hover:bg-gray-600 text-gray-300" : "border-gray-300 hover:bg-gray-100 text-gray-700"}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className={`flex items-start gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <MapPin className={`w-5 h-5 mt-0.5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <div className="flex-1">
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Address</p>
                <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{professorData.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"}`}>
                <BookOpen className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Active Courses</p>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{activeCourses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-green-900/30" : "bg-green-100"}`}>
                <Users className={`w-6 h-6 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
              </div>
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Total Students</p>
                <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{totalStudents}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
          <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Teaching Courses</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {professorCourses.map(course => (
              <div key={course.id} className={`p-4 border rounded-lg transition-colors ${theme === "dark" ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{course.name}</h4>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{course.code}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === "dark" ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
                    {course.enrolledStudents} students
                  </span>
                </div>
                <div className={`flex items-center gap-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {course.schedule}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Change Profile Picture</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                  {(tempProfilePic || professorData.profilePic) ? (
                    <img 
                      src={tempProfilePic || professorData.profilePic || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
                      alt={professorData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(professorData.name)}</span>
                  )}
                </div>
              </div>

              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${theme === "dark" ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Click to upload new photo</p>
                <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Supports JPG, PNG, WEBP</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={cancelProfilePicture}
                  className={`px-4 py-2 border rounded-md flex items-center gap-2 ${theme === "dark" ? "border-gray-600 hover:bg-gray-700 text-gray-300" : "border-gray-300 hover:bg-gray-50 text-gray-700"}`}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={saveProfilePicture}
                  disabled={!tempProfilePic}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Info Modal */}
      {isEditingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className={`p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Edit Contact Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="phone" className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Address</label>
                <textarea
                  id="address"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="Enter your address"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={cancelContactEdit}
                  className={`px-4 py-2 border rounded-md flex items-center gap-2 ${theme === "dark" ? "border-gray-600 hover:bg-gray-700 text-gray-300" : "border-gray-300 hover:bg-gray-50 text-gray-700"}`}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={saveContactInfo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
