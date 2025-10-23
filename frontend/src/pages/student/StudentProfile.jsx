import { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Edit3, Save, X, Camera, Upload } from 'lucide-react';
import { mockStudent } from '../data/mockData';
import { useTheme } from '../../context/Theme';

export default function StudentProfile() {
  const [studentData, setStudentData] = useState(mockStudent);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempProfilePic, setTempProfilePic] = useState(null);
  const [tempPhone, setTempPhone] = useState(studentData.phone);
  const [tempAddress, setTempAddress] = useState(studentData.address);
  const fileInputRef = useRef(null);

  const { theme } = useTheme();

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
      setStudentData(prev => ({
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
    setStudentData(prev => ({
      ...prev,
      phone: tempPhone,
      address: tempAddress
    }));
    setIsEditingContact(false);
  };

  const cancelContactEdit = () => {
    setTempPhone(studentData.phone);
    setTempAddress(studentData.address);
    setIsEditingContact(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className={`h-[calc(100vh-30vh)] flex flex-col gap-2 ${theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-white"}`}>
      <div className={`rounded-lg shadow ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}>
        <div className={`p-6 text-center ${theme === "dark" ? "border-gray-700" : "border-gray-200"} border-b`}>
          <div className="flex justify-center mb-4 relative">
            <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
              {(tempProfilePic || studentData.profilePic) ? (
                <img 
                  src={tempProfilePic || studentData.profilePic} 
                  alt={studentData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(studentData.name)}</span>
              )}
            </div>
            <button
              onClick={() => setIsEditingProfile(true)}
              className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 flex items-center justify-center ${theme === "dark" ? "bg-gray-700 border-gray-600 hover:bg-gray-600" : "bg-white border-gray-300 hover:bg-gray-50"} border`}
            >
              <Camera className={`w-4 h-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
            </button>
          </div>
          <h3 className={`text-xl font-bold flex items-center justify-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {studentData.name}
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
              <GraduationCap className="w-3 h-3" />
              Student
            </span>
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <User className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Student ID</p>
                <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{studentData.id}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <Mail className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Email</p>
                <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{studentData.email}</p>
              </div>
            </div>
            
            <div className={`flex items-center justify-between gap-3 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <div className="flex items-center gap-3 flex-1">
                <Phone className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                <div className="flex-1">
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Phone</p>
                  <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{studentData.phone}</p>
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
                <p className={theme === "dark" ? "text-gray-200" : "text-gray-900"}>{studentData.address}</p>
              </div>
            </div>
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
                  {(tempProfilePic || studentData.profilePic) ? (
                    <img 
                      src={tempProfilePic || studentData.profilePic} 
                      alt={studentData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(studentData.name)}</span>
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

      {/* Info Card */}
      <div className={`border rounded-lg ${theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"}`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-blue-400" : "bg-blue-500"}`}></div>
            <div>
              <p className={`text-sm font-medium ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>Profile Management</p>
              <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                Click the camera icon to change your profile picture, or the edit button to update your contact information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
