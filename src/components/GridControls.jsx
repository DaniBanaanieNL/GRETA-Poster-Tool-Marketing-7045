import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiFileText, FiMaximize, FiRuler, FiGrid, FiColumns, FiLayers } = FiIcons;

const GridControls = ({
  gridSize,
  setGridSize,
  pageSize,
  setPageSize,
  orientation,
  setOrientation
}) => {
  const presetSizes = [
    { rows: 2, cols: 2, label: '2×2 (4 vellen)', icon: FiGrid },
    { rows: 3, cols: 3, label: '3×3 (9 vellen)', icon: FiGrid },
    { rows: 2, cols: 3, label: '2×3 (6 vellen)', icon: FiColumns },
    { rows: 3, cols: 4, label: '3×4 (12 vellen)', icon: FiGrid },
    { rows: 4, cols: 4, label: '4×4 (16 vellen)', icon: FiGrid },
    { rows: 5, cols: 5, label: '5×5 (25 vellen)', icon: FiLayers }
  ];

  // Calculate physical dimensions
  const getPhysicalDimensions = () => {
    // Page dimensions in cm
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
      height: Math.round(totalHeight * 10) / 10,
      pageWidth: Math.round(pageWidth * 10) / 10,
      pageHeight: Math.round(pageHeight * 10) / 10
    };
  };

  const dimensions = getPhysicalDimensions();

  return (
    <div className="space-y-6">
      {/* Page Size Selection */}
      <div className="relative">
        <h4 className="font-medium text-gray-700 mb-3">Papierformaat</h4>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPageSize('A4')}
            className={`
              p-4 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2
              ${pageSize === 'A4'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <SafeIcon icon={FiFileText} className="text-2xl" />
            <div className="text-center">
              <div>A4</div>
              <div className="text-xs opacity-75">21×29.7cm</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPageSize('A3')}
            className={`
              p-4 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2
              ${pageSize === 'A3'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <SafeIcon icon={FiMaximize} className="text-2xl" />
            <div className="text-center">
              <div>A3</div>
              <div className="text-xs opacity-75">29.7×42cm</div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Orientation Control */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Oriëntatie</h4>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOrientation('portrait')}
            className={`
              p-4 rounded-lg text-sm font-medium transition-all duration-200 border-2
              ${orientation === 'portrait'
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            <div className="w-8 h-12 mx-auto mb-2 border-2 border-current rounded-sm flex items-center justify-center">
              {pageSize}
            </div>
            <div>Staand</div>
            <div className="text-xs opacity-75 mt-1">
              {pageSize === 'A4' ? '21×29.7cm' : '29.7×42cm'}
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOrientation('landscape')}
            className={`
              p-4 rounded-lg text-sm font-medium transition-all duration-200 border-2
              ${orientation === 'landscape'
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            <div className="h-8 w-12 mx-auto mb-2 border-2 border-current rounded-sm flex items-center justify-center text-xs">
              {pageSize}
            </div>
            <div>Liggend</div>
            <div className="text-xs opacity-75 mt-1">
              {pageSize === 'A4' ? '29.7×21cm' : '42×29.7cm'}
            </div>
          </motion.button>
        </div>
      </div>

      {/* Grid Size Presets */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Postergrootte</h4>
        <div className="grid grid-cols-2 gap-2">
          {presetSizes.map((preset) => (
            <motion.button
              key={`${preset.rows}x${preset.cols}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGridSize({ rows: preset.rows, cols: preset.cols })}
              className={`
                p-4 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center gap-2
                ${gridSize.rows === preset.rows && gridSize.cols === preset.cols
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                }
              `}
            >
              <SafeIcon icon={preset.icon} className="text-xl" />
              <span>{preset.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Grid Size */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Aangepaste grootte</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Rijen
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={gridSize.rows}
              onChange={(e) => setGridSize((prev) => ({
                ...prev,
                rows: Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Kolommen
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={gridSize.cols}
              onChange={(e) => setGridSize((prev) => ({
                ...prev,
                cols: Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Physical Dimensions Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <SafeIcon icon={FiRuler} className="text-blue-600" />
          <h4 className="font-medium text-gray-800">Uiteindelijke afmetingen</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Totale breedte:</span>
            <span className="font-bold text-blue-700 text-lg">{dimensions.width} cm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Totale hoogte:</span>
            <span className="font-bold text-blue-700 text-lg">{dimensions.height} cm</span>
          </div>
          <div className="pt-2 border-t border-blue-200">
            <div className="text-sm text-gray-600">
              <div>Per vel: {dimensions.pageWidth} × {dimensions.pageHeight} cm</div>
              <div className="mt-1">
                {gridSize.rows * gridSize.cols} {pageSize}-vellen ({orientation === 'portrait' ? 'staand' : 'liggend'})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridControls;