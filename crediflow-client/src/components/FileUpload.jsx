import React, { useRef, useState } from 'react';
import { FaUpload, FaTimes, FaFilePdf, FaFileImage, FaFile } from 'react-icons/fa';

const FileUpload = ({ onFileSelect, onCancel }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Validate file
  const validateAndSetFile = (file) => {
    // Allowed file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF, JPEG, or PNG files only.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size should not exceed 5MB.');
      return;
    }

    setSelectedFile(file);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Upload file
  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      setSelectedFile(null);
    }
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (!file) return <FaFile className="text-5xl text-gray-400 dark:text-gray-500" />;
    
    if (file.type === 'application/pdf') {
      return <FaFilePdf className="text-5xl text-red-500 dark:text-red-400 animate-float" />;
    } else if (file.type.startsWith('image/')) {
      return <FaFileImage className="text-5xl text-blue-500 dark:text-blue-400 animate-float" />;
    }
    return <FaFile className="text-5xl text-gray-400 dark:text-gray-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl p-6 shadow-2xl animate-scale-in transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
          <FaUpload className="text-primary-600 dark:text-primary-400" />
          <span>Upload Document</span>
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
          title="Cancel"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Drag and drop area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-105' 
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
      >
        {selectedFile ? (
          // File selected view
          <div className="space-y-4 animate-scale-in">
            <div className="flex justify-center">
              {getFileIcon(selectedFile)}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex space-x-3 justify-center mt-6">
              <button
                onClick={handleUpload}
                className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 dark:from-primary-700 dark:to-purple-700 dark:hover:from-primary-600 dark:hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ripple"
              >
                <FaUpload />
                <span>Upload</span>
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          // Upload prompt
          <div className="space-y-4">
            <FaUpload className="text-5xl text-gray-400 dark:text-gray-500 mx-auto animate-float" />
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Drag and drop your file here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold mt-2 transition-all duration-300 transform hover:scale-110"
              >
                Browse Files
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported: PDF, JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
      />

      {/* Quick tips */}
      <div className="mt-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 animate-fade-in">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>💡 Tip:</strong> Ensure your documents are clear and readable. 
          Accepted documents: PAN Card, Aadhaar Card, Salary Slips, Bank Statements.
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
