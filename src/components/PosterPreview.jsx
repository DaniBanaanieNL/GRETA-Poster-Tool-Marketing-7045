import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiInfo } = FiIcons;

const PosterPreview = ({ image, gridSize, showMargins, pageSize, orientation }) => {
  const { rows, cols } = gridSize;

  // Bepaal aspect ratio op basis van oriëntatie
  const getAspectRatio = () => {
    const dimensions = {
      A4: { width: 210, height: 297 },
      A3: { width: 297, height: 420 }
    };
    
    if (orientation === 'landscape') {
      return `${dimensions[pageSize].height}/${dimensions[pageSize].width}`;
    }
    return `${dimensions[pageSize].width}/${dimensions[pageSize].height}`;
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push(
          <div
            key={`${row}-${col}`}
            className="relative bg-white rounded overflow-hidden"
            style={{ aspectRatio: getAspectRatio() }}
          >
            {image && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundPosition: `${(col / (cols - 1 || 1)) * 100}% ${(row / (rows - 1 || 1)) * 100}%`,
                  backgroundSize: `${cols * 100}% ${rows * 100}%`
                }}
              />
            )}
            {showMargins && (
              <div className="absolute inset-0 border-2 border-dashed border-red-400 pointer-events-none" />
            )}
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
              {row + 1},{col + 1}
            </div>
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-gray-800">Preview van je poster</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            {pageSize} {orientation === 'portrait' ? 'Staand' : 'Liggend'}
          </span>
          <span className="text-gray-600">{rows}×{cols} grid</span>
        </div>
      </div>
      <div
        className="grid gap-2 mx-auto max-w-2xl"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {renderGrid()}
      </div>
      <div className="mt-4 flex gap-3 items-start">
        <SafeIcon icon={FiInfo} className="text-blue-500 mt-1 flex-shrink-0" />
        <div className="text-sm text-gray-600">
          De preview toont hoe je afbeelding over {rows * cols} {pageSize}-vellen wordt verdeeld in {orientation === 'portrait' ? 'staande' : 'liggende'} oriëntatie.
          {showMargins && " De rode lijnen tonen snijranden voor perfecte uitlijning."}
        </div>
      </div>
    </div>
  );
};

export default PosterPreview;