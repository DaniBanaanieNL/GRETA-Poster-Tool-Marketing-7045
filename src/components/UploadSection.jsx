import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUpload, FiImage } = FiIcons;

const UploadSection = ({ onImageUpload }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`
          relative border-3 border-dashed rounded-3xl p-12 lg:p-20 text-center transition-all duration-300
          ${isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-25'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <SafeIcon
          icon={FiUpload}
          className={`text-6xl mx-auto mb-6 transition-colors ${isDragging ? 'text-purple-500' : 'text-gray-400'}`}
        />
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Sleep je afbeelding hierheen
        </h3>
        <p className="text-gray-600 mb-8">
          Of klik om een bestand te selecteren
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <SafeIcon icon={FiImage} className="inline mr-2" />
          Kies afbeelding
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        <div className="mt-8 text-sm text-gray-500">
          Ondersteunt: JPG, PNG, SVG • Max 10MB
        </div>
      </motion.div>
    </div>
  );
};

export default UploadSection;