import { useState, useRef } from 'react';
import { Camera, Upload, Scan, CheckCircle, AlertCircle, X } from 'lucide-react';
import { mockStudents } from '../data/mockData';
import { useTheme } from '../../context/Theme';

const mockDetectedFaces = [
  {
    id: 'face1',
    boundingBox: { x: 120, y: 80, width: 60, height: 80 },
    confidence: 0.95,
    matchedStudent: { id: 'STU001', name: 'Alex Johnson' }
  },
  {
    id: 'face2',
    boundingBox: { x: 220, y: 120, width: 55, height: 75 },
    confidence: 0.92,
    matchedStudent: { id: 'STU002', name: 'Emma Wilson' }
  },
  {
    id: 'face3',
    boundingBox: { x: 350, y: 100, width: 58, height: 78 },
    confidence: 0.88,
    isUnknown: true
  },
  {
    id: 'face4',
    boundingBox: { x: 450, y: 140, width: 62, height: 82 },
    confidence: 0.91,
    matchedStudent: { id: 'STU004', name: 'Sarah Davis' }
  },
  {
    id: 'face5',
    boundingBox: { x: 300, y: 220, width: 59, height: 79 },
    confidence: 0.76,
    isUnknown: true
  }
];

export default function FacialRecognitionAttendance() {
  const { theme } = useTheme();
  const [stage, setStage] = useState('initial');
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [selectedFace, setSelectedFace] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraSupported, setCameraSupported] = useState(true);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result);
        startProcessing();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      setCameraError('Camera is not supported in this browser or environment');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setCameraError(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Camera is not supported in this browser.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints cannot be satisfied.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera access blocked due to security restrictions. Please use HTTPS.';
      }
      
      setCameraError(errorMessage);
      setIsStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreamActive(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        
        const stream = video.srcObject;
        stream?.getTracks().forEach(track => track.stop());
        setIsStreamActive(false);
        
        startProcessing();
      }
    }
  };

  const startProcessing = () => {
    setStage('uploading');
    setProgress(10);
    
    setTimeout(() => {
      setProgress(30);
      setStage('processing');
    }, 1000);
    
    setTimeout(() => {
      setProgress(60);
    }, 2000);
    
    setTimeout(() => {
      setProgress(90);
    }, 3000);
    
    setTimeout(() => {
      setProgress(100);
      setDetectedFaces(mockDetectedFaces);
      setStage('reviewing');
    }, 4000);
  };

  const assignStudentToFace = (faceId, studentId) => {
    setDetectedFaces(prev => 
      prev.map(face => 
        face.id === faceId 
          ? { 
              ...face, 
              matchedStudent: mockStudents.find(s => s.id === studentId),
              isUnknown: false 
            }
          : face
      )
    );
  };

  const discardFace = (faceId) => {
    setDetectedFaces(prev => prev.filter(face => face.id !== faceId));
  };

  const completeAttendance = () => {
    setStage('completed');
  };

  const reset = () => {
    setStage('initial');
    setProgress(0);
    setCapturedImage(null);
    setDetectedFaces([]);
    setSelectedFace(null);
    setCameraError(null);
    stopCamera();
  };

  const recognizedStudents = detectedFaces.filter(face => face.matchedStudent);
  const unknownFaces = detectedFaces.filter(face => face.isUnknown);

  if (stage === 'initial') {
    return (
      <div className="space-y-6">
        <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className={`p-6 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <h3 className={`text-xl font-bold flex items-center gap-2 mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              <Scan className="w-6 h-6" />
              AI-Powered Attendance
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Take a class photo or upload an image to automatically detect student attendance
            </p>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Camera Capture</h3>
                
                {cameraError && (
                  <div className={`border rounded-lg ${theme === "dark" ? "border-red-900 bg-red-950" : "border-red-200 bg-red-50"}`}>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-red-400" : "text-red-600"}`} />
                        <div>
                          <p className={`text-sm font-medium ${theme === "dark" ? "text-red-300" : "text-red-800"}`}>Camera Access Error</p>
                          <p className={`text-sm mt-1 ${theme === "dark" ? "text-red-400" : "text-red-700"}`}>{cameraError}</p>
                          {cameraError.includes('permission') && (
                            <div className={`mt-2 text-xs ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                              <p>• Click the camera icon in your browser's address bar</p>
                              <p>• Select "Allow" for camera permissions</p>
                              <p>• Refresh the page and try again</p>
                            </div>
                          )}
                          {cameraError.includes('HTTPS') && (
                            <p className={`text-xs mt-2 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                              Camera access requires a secure connection (HTTPS) in most browsers.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isStreamActive ? (
                  <div className="space-y-2">
                    <button 
                      onClick={startCamera} 
                      disabled={!cameraSupported}
                      className="w-full h-24 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      <Camera className="w-8 h-8" />
                      {cameraSupported ? 'Start Camera' : 'Camera Not Supported'}
                    </button>
                    {!cameraSupported && (
                      <p className={`text-xs text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Please use a modern browser with camera support or upload a photo instead.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className={`w-full rounded-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={capturePhoto}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Capture Photo
                      </button>
                      <button 
                        onClick={stopCamera}
                        className={`px-4 py-2 border rounded-lg flex items-center justify-center ${theme === "dark" ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Upload Photo</h3>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${theme === "dark" ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Click to upload class photo</p>
                  <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Supports JPG, PNG, WEBP</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className={`border-t pt-4 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <p className={`text-sm font-medium text-center mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Try Demo</p>
                  <button
                    onClick={() => {
                      setCapturedImage('https://images.unsplash.com/photo-1660351174962-e2a1fbb9af09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzcyUyMHBob3RvJTIwc3R1ZGVudHMlMjBkZW1vfGVufDF8fHx8MTc1ODQ5MDMwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral');
                      startProcessing();
                    }}
                    className={`w-full px-4 py-2 border rounded-lg flex items-center justify-center gap-2 ${theme === "dark" ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"}`}
                  >
                    <Scan className="w-4 h-4" />
                    Use Demo Class Photo
                  </button>
                  <p className={`text-xs text-center mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Test the AI attendance system with a sample image
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  if (stage === 'uploading' || stage === 'processing') {
    return (
      <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`p-6 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <Scan className="w-6 h-6 animate-spin" />
            {stage === 'uploading' ? 'Uploading Image...' : 'Processing with AI...'}
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {capturedImage && (
            <div className="flex justify-center">
              <img 
                src={capturedImage} 
                alt="Captured class" 
                className={`max-h-64 rounded-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className={`w-full rounded-full h-3 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className={`text-sm text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {stage === 'uploading' && 'Uploading image...'}
              {stage === 'processing' && progress < 40 && 'Detecting faces...'}
              {stage === 'processing' && progress >= 40 && progress < 80 && 'Running facial recognition...'}
              {stage === 'processing' && progress >= 80 && 'Matching with student database...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'reviewing') {
    return (
      <div className="space-y-6">
        <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className={`p-6 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                <CheckCircle className="w-6 h-6 text-green-600" />
                Detection Results
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={completeAttendance}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Complete Attendance
                </button>
                <button 
                  onClick={reset}
                  className={`px-4 py-2 border rounded-lg ${theme === "dark" ? "border-gray-600 hover:bg-gray-700 text-white" : "border-gray-300 hover:bg-gray-50 text-gray-900"}`}
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {capturedImage && (
              <div className="relative flex justify-center">
                <div className="relative inline-block">
                  <img 
                    src={capturedImage} 
                    alt="Class with detected faces" 
                    className={`max-h-80 rounded-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
                  />
                  {detectedFaces.map(face => (
                    <div
                      key={face.id}
                      className={`absolute border-2 ${
                        face.isUnknown ? 'border-red-500' : 'border-green-500'
                      } ${selectedFace === face.id ? 'border-4' : ''} cursor-pointer`}
                      style={{
                        left: `${(face.boundingBox.x / 600) * 100}%`,
                        top: `${(face.boundingBox.y / 400) * 100}%`,
                        width: `${(face.boundingBox.width / 600) * 100}%`,
                        height: `${(face.boundingBox.height / 400) * 100}%`,
                      }}
                      onClick={() => setSelectedFace(face.id)}
                    >
                      <div className={`absolute -top-6 left-0 px-2 py-1 text-xs rounded ${
                        face.isUnknown ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {face.matchedStudent?.name || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <h4 className={`text-lg font-bold ${theme === "dark" ? "text-green-400" : "text-green-700"}`}>
                    ✓ Recognized Students ({recognizedStudents.length})
                  </h4>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {recognizedStudents.map(face => (
                      <div key={face.id} className={`flex items-center justify-between p-2 rounded-lg ${theme === "dark" ? "bg-green-950" : "bg-green-50"}`}>
                        <div>
                          <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{face.matchedStudent?.name}</p>
                          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Confidence: {(face.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"}`}>
                          Present
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <h4 className={`text-lg font-bold ${theme === "dark" ? "text-red-400" : "text-red-700"}`}>
                    ⚠ Unknown Faces ({unknownFaces.length})
                  </h4>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {unknownFaces.map(face => (
                      <div key={face.id} className={`p-3 border rounded-lg ${theme === "dark" ? "border-red-900 bg-red-950" : "border-red-200 bg-red-50"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`font-medium ${theme === "dark" ? "text-red-300" : "text-red-800"}`}>Unknown Face</p>
                          <p className={`text-sm ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                            {(face.confidence * 100).toFixed(1)}% confidence
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <select
                            onChange={(e) => assignStudentToFace(face.id, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                            defaultValue=""
                          >
                            <option value="" disabled>Select student...</option>
                            {mockStudents
                              .filter(student => !recognizedStudents.some(rf => rf.matchedStudent?.id === student.id))
                              .map(student => (
                                <option key={student.id} value={student.id}>
                                  {student.name} ({student.id})
                                </option>
                              ))}
                          </select>
                          
                          <button 
                            onClick={() => discardFace(face.id)}
                            className={`w-full px-3 py-2 border rounded-md text-sm flex items-center justify-center gap-2 ${theme === "dark" ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"}`}
                          >
                            <X className="w-4 h-4" />
                            Discard Face
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'completed') {
    return (
      <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className={`p-6 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === "dark" ? "text-green-400" : "text-green-700"}`}>
            <CheckCircle className="w-6 h-6" />
            Attendance Completed
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3 text-center">
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-green-950" : "bg-green-50"}`}>
              <div className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                {recognizedStudents.length}
              </div>
              <div className={`text-sm ${theme === "dark" ? "text-green-300" : "text-green-800"}`}>Students Present</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-red-950" : "bg-red-50"}`}>
              <div className={`text-2xl font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                {mockStudents.length - recognizedStudents.length}
              </div>
              <div className={`text-sm ${theme === "dark" ? "text-red-300" : "text-red-800"}`}>Students Absent</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-blue-950" : "bg-blue-50"}`}>
              <div className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                {((recognizedStudents.length / mockStudents.length) * 100).toFixed(1)}%
              </div>
              <div className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>Attendance Rate</div>
            </div>
          </div>

          <div className={`rounded-lg shadow border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`p-6 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
              <h4 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Final Attendance Report</h4>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Student ID</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Name</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Status</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudents.map(student => {
                      const recognizedFace = recognizedStudents.find(
                        face => face.matchedStudent?.id === student.id
                      );
                      return (
                        <tr key={student.id} className={`border-b ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}>
                          <td className={`py-3 px-4 font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{student.id}</td>
                          <td className={`py-3 px-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{student.name}</td>
                          <td className="py-3 px-4">
                            {recognizedFace ? (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"}`}>
                                Present
                              </span>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"}`}>
                                Absent
                              </span>
                            )}
                          </td>
                          <td className={`py-3 px-4 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                            {recognizedFace 
                              ? `${(recognizedFace.confidence * 100).toFixed(1)}%`
                              : '-'
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Take New Attendance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
