import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UploadSection from './components/UploadSection';
import PreviewSection from './components/PreviewSection';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [gridSize, setGridSize] = useState({ rows: 2, cols: 2 });
  const [showMargins, setShowMargins] = useState(true);
  const [pageSize, setPageSize] = useState('A4'); // 'A4' or 'A3'
  const [orientation, setOrientation] = useState('portrait'); // 'portrait' or 'landscape'
  
  // Preload watermark image
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = 'https://media.discordapp.net/attachments/832511681182957589/1393933658758320149/demo.png?ex=6874f962&is=6873a7e2&hm=09fad4c62ba4877839e4b87cb67bab385e7ca836eedda95e27951bcc475930da&=&format=webp&quality=lossless';
  }, []);

  const handleImageUpload = (imageData) => {
    setUploadedImage(imageData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!uploadedImage ? (
          <UploadSection onImageUpload={handleImageUpload} />
        ) : (
          <PreviewSection
            image={uploadedImage}
            gridSize={gridSize}
            setGridSize={setGridSize}
            showMargins={showMargins}
            setShowMargins={setShowMargins}
            pageSize={pageSize}
            setPageSize={setPageSize}
            orientation={orientation}
            setOrientation={setOrientation}
            onNewImage={() => setUploadedImage(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;