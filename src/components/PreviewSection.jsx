import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import GridControls from './GridControls';
import PosterPreview from './PosterPreview';
import { optimizeImage } from '../lib/supabase';
import { generatePDF } from '../lib/pdfGenerator';

const { FiZap, FiSettings, FiRotateCw, FiEye, FiEyeOff, FiDownload, FiRefreshCw, FiCheck, FiRuler, FiImage, FiCrown, FiCode } = FiIcons;

const PreviewSection = ({ image, gridSize, setGridSize, showMargins, setShowMargins, pageSize, setPageSize, orientation, setOrientation, onNewImage }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedImage, setOptimizedImage] = useState(null);
  const [optimizationError, setOptimizationError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [showWatermark, setShowWatermark] = useState(true); // Default aan, maar niet uitschakelbaar

  const handleOptimizeImage = async () => {
    setIsOptimizing(true);
    setOptimizationError(null);
    try {
      const pageDimensions = {
        A4: { width: 21.0, height: 29.7 },
        A3: { width: 29.7, height: 42.0 }
      };
      const page = pageDimensions[pageSize];
      let pageWidth, pageHeight;
      if (orientation === 'portrait') {
        pageWidth = page.width;
        pageHeight = page.height;
      } else {
        pageWidth = page.height;
        pageHeight = page.width;
      }

      const dpi = 300;
      const pixelsPerCm = dpi / 2.54;
      const targetWidth = Math.round(pageWidth * gridSize.cols * pixelsPerCm);
      const targetHeight = Math.round(pageHeight * gridSize.rows * pixelsPerCm);

      const enhanced = await optimizeImage(image, targetWidth, targetHeight);
      setOptimizedImage(enhanced);
    } catch (error) {
      console.error('Optimization failed:', error);
      setOptimizationError('De optimalisatie kon niet worden voltooid. Probeer het opnieuw.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const pdf = await generatePDF(
        optimizedImage || image,
        gridSize,
        pageSize,
        orientation,
        showMargins,
        showWatermark
      );

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const fileName = `GRETA-Poster-${gridSize.rows}x${gridSize.cols}-${pageSize}-${timestamp}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setDownloadError('De PDF kon niet worden gegenereerd. Controleer je afbeelding en probeer het opnieuw.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate physical dimensions
  const getPhysicalDimensions = () => {
    const pageDimensions = {
      A4: { width: 21.0, height: 29.7 },
      A3: { width: 29.7, height: 42.0 }
    };
    const page = pageDimensions[pageSize];
    let pageWidth, pageHeight;
    if (orientation === 'portrait') {
      pageWidth = page.width;
      pageHeight = page.height;
    } else {
      pageWidth = page.height;
      pageHeight = page.width;
    }

    const totalWidth = pageWidth * gridSize.cols;
    const totalHeight = pageHeight * gridSize.rows;
    return {
      width: Math.round(totalWidth * 10) / 10,
      height: Math.round(totalHeight * 10) / 10
    };
  };

  const dimensions = getPhysicalDimensions();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Download Banner at the top */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <SafeIcon icon={FiRuler} className="text-green-600 text-xl" />
              <div>
                <span className="font-medium text-gray-700">Eindformaat:</span>
                <span className="font-bold text-green-700 text-lg ml-2">
                  {dimensions.width} × {dimensions.height} cm
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`
                px-6 py-3 rounded-lg font-medium shadow-md flex items-center gap-2
                ${isDownloading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'}
              `}
            >
              {isDownloading ? (
                <>
                  <SafeIcon icon={FiRotateCw} className="animate-spin" />
                  PDF maken...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiDownload} />
                  Download PDF
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LINKER KOLOM: Poster instellingen */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <SafeIcon icon={FiSettings} className="text-purple-500" />
              Poster instellingen
            </h3>
            <GridControls
              gridSize={gridSize}
              setGridSize={setGridSize}
              pageSize={pageSize}
              setPageSize={setPageSize}
              orientation={orientation}
              setOrientation={setOrientation}
            />
          </div>
        </div>

        {/* MIDDEN & RECHTS: Controls en Preview (2 kolommen breed) */}
        <div className="md:col-span-2 space-y-6">
          {/* EERST: AI-optimalisatie en Weergave opties in grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI-optimalisatie */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <SafeIcon icon={FiZap} className="text-yellow-500" />
                AI-optimalisatie
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  <SafeIcon icon={FiCode} className="text-red-500 mr-1" />
                  Beta
                </span>
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Verbeter de kwaliteit van je afbeelding voor grote formaten met AI-technologie.
                </p>

                {optimizationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {optimizationError}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {optimizedImage && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <SafeIcon icon={FiCheck} className="text-green-500" />
                      <span>Optimalisatie voltooid</span>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOptimizeImage}
                    disabled={isOptimizing}
                    className={`
                      px-4 py-2 rounded-lg font-medium shadow-sm
                      ${isOptimizing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:shadow-md'}
                    `}
                  >
                    {isOptimizing ? (
                      <span className="flex items-center gap-2">
                        <SafeIcon icon={FiRotateCw} className="animate-spin" />
                        Optimaliseren...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <SafeIcon icon={FiZap} />
                        {optimizedImage ? 'Opnieuw' : 'Optimaliseer'}
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Weergave opties */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <SafeIcon icon={FiEye} className="text-blue-500" />
                Weergave opties
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="show-margins" className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="show-margins"
                      type="checkbox"
                      checked={showMargins}
                      onChange={() => setShowMargins(!showMargins)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Toon snijlijnen</span>
                  </label>
                  <SafeIcon
                    icon={showMargins ? FiEye : FiEyeOff}
                    className={`${showMargins ? 'text-purple-500' : 'text-gray-400'}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id="show-watermark"
                      type="checkbox"
                      checked={showWatermark}
                      disabled={true}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 cursor-not-allowed opacity-70"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-700">Watermerk</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        <SafeIcon icon={FiCrown} className="text-orange-500 mr-1" />
                        Premium
                      </span>
                    </div>
                  </div>
                  <SafeIcon icon={FiImage} className="text-orange-500" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onNewImage}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <SafeIcon icon={FiRefreshCw} />
                  Nieuwe afbeelding
                </motion.button>
              </div>
            </div>
          </div>

          {/* DAARNA: Preview van je poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PosterPreview
              image={optimizedImage || image}
              gridSize={gridSize}
              showMargins={showMargins}
              pageSize={pageSize}
              orientation={orientation}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;