import jsPDF from 'jspdf';

// Externe watermerk URL
const WATERMARK_URL = 'https://media.discordapp.net/attachments/832511681182957589/1393933658758320149/demo.png?ex=6874f962&is=6873a7e2&hm=09fad4c62ba4877839e4b87cb67bab385e7ca836eedda95e27951bcc475930da&=&format=webp&quality=lossless';

export const generatePDF = async (image, gridSize, pageSize, orientation, showMargins, showWatermark = true) => {
  // Maak een nieuwe PDF met de juiste oriëntatie
  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize
  });

  // Pagina afmetingen in mm
  const pageDimensions = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 }
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

  // Bereken fysieke afmetingen
  const totalWidth = (pageWidth * gridSize.cols) / 10;
  const totalHeight = (pageHeight * gridSize.rows) / 10;

  // Laad watermerk indien nodig
  let watermarkDataUrl = null;
  if (showWatermark) {
    try {
      // Laad het watermerk zonder witte achtergrond toe te voegen
      watermarkDataUrl = await loadImageAsDataURL(WATERMARK_URL, false);
    } catch (error) {
      console.error('Failed to load watermark:', error);
    }
  }

  // Voeg voorpagina toe
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(139, 92, 246);
  const title = 'GRETA POSTER';
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, (pageWidth - titleWidth) / 2, 50);

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const subtitle = `${gridSize.rows}×${gridSize.cols} ${pageSize} poster (${orientation === 'portrait' ? 'staand' : 'liggend'})`;
  const subtitleWidth = pdf.getTextWidth(subtitle);
  pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, 70);

  // Voeg voorbeeld afbeelding toe
  const maxPreviewWidth = pageWidth - 40;
  const maxPreviewHeight = pageHeight - 200;
  const gridRatio = gridSize.cols / gridSize.rows;
  let previewWidth, previewHeight;

  if (gridRatio > maxPreviewWidth / maxPreviewHeight) {
    previewWidth = maxPreviewWidth;
    previewHeight = maxPreviewWidth / gridRatio;
  } else {
    previewHeight = maxPreviewHeight;
    previewWidth = maxPreviewHeight * gridRatio;
  }

  const previewX = (pageWidth - previewWidth) / 2;
  const previewStartY = 90;

  // Voeg de afbeelding toe aan de preview
  pdf.addImage(image, 'JPEG', previewX, previewStartY, previewWidth, previewHeight);

  // Voeg rasterlijnen toe voor preview
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  const cellWidth = previewWidth / gridSize.cols;
  const cellHeight = previewHeight / gridSize.rows;

  // Teken preview raster
  for (let row = 1; row < gridSize.rows; row++) {
    const y = previewStartY + (row * cellHeight);
    pdf.line(previewX, y, previewX + previewWidth, y);
  }
  for (let col = 1; col < gridSize.cols; col++) {
    const x = previewX + (col * cellWidth);
    pdf.line(x, previewStartY, x, previewStartY + previewHeight);
  }

  // Voeg marges toe indien ingeschakeld
  if (showMargins) {
    pdf.setDrawColor(239, 68, 68);
    pdf.setLineWidth(0.3);
    pdf.setLineDash([2, 1]);
    for (let row = 1; row < gridSize.rows; row++) {
      const y = previewStartY + (row * cellHeight);
      pdf.line(previewX, y, previewX + previewWidth, y);
    }
    for (let col = 1; col < gridSize.cols; col++) {
      const x = previewX + (col * cellWidth);
      pdf.line(x, previewStartY, x, previewStartY + previewHeight);
    }
    pdf.setLineDash([]);
    pdf.setDrawColor(239, 68, 68);
    pdf.setLineWidth(0.5);
    pdf.setLineDash([2, 1]);
    pdf.rect(previewX, previewStartY, previewWidth, previewHeight);
    pdf.setLineDash([]);
  }

  // Reset lijn eigenschappen
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.1);

  // Alleen footer op pagina 1 behouden
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Gemaakt met GRETA - De slimme A4-poster maker', 20, pageHeight - 10);

  // Bereken totaal aantal pagina's voor raster cellen
  const totalPages = gridSize.rows * gridSize.cols;
  let currentPageIndex = 0;

  // Genereer individuele pagina's voor elk raster cel
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      currentPageIndex++;
      const isLastPage = currentPageIndex === totalPages;

      pdf.addPage(pageSize, orientation);

      const margin = showMargins ? 5 : 0;
      const printWidth = pageWidth - (2 * margin);
      const printHeight = pageHeight - (2 * margin);

      // Maak een tijdelijk canvas om de afbeelding te croppen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      await new Promise((resolve) => {
        img.onload = () => {
          const sourceWidth = img.width / gridSize.cols;
          const sourceHeight = img.height / gridSize.rows;
          const sourceX = col * sourceWidth;
          const sourceY = row * sourceHeight;

          canvas.width = sourceWidth;
          canvas.height = sourceHeight;
          
          // Vul canvas met witte achtergrond voor transparante afbeeldingen
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, sourceWidth, sourceHeight
          );

          const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);

          // Voeg de gecropte afbeelding toe aan de PDF
          pdf.addImage(croppedImageData, 'JPEG', margin, margin, printWidth, printHeight);

          // Voeg watermerk toe op laatste pagina
          if (isLastPage && showWatermark && watermarkDataUrl) {
            const originalWatermarkRatio = 740 / 430;
            let watermarkWidth, watermarkHeight;

            // Gewijzigd naar 115% (1.15)
            const maxWatermarkSize = Math.min(pageWidth, pageHeight) * 0.4 * 1.15;

            if (originalWatermarkRatio > 1) {
              watermarkWidth = maxWatermarkSize;
              watermarkHeight = watermarkWidth / originalWatermarkRatio;
            } else {
              watermarkHeight = maxWatermarkSize;
              watermarkWidth = watermarkHeight * originalWatermarkRatio;
            }

            const marginFromEdge = 8;
            const watermarkX = pageWidth - watermarkWidth - marginFromEdge;
            const watermarkY = pageHeight - watermarkHeight - marginFromEdge;

            try {
              pdf.setGState(new pdf.GState({ opacity: 0.7 }));
              pdf.addImage(watermarkDataUrl, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
              pdf.setGState(new pdf.GState({ opacity: 1.0 }));
            } catch (error) {
              console.warn('Kon watermerk niet toevoegen:', error);
            }
          }

          if (showMargins) {
            // Voeg snijlijnen toe
            pdf.setDrawColor(239, 68, 68);
            pdf.setLineWidth(0.3);
            pdf.setLineDash([1, 1]);
            const markLength = 3;

            // Linksbovenhoek
            pdf.line(margin - markLength, margin, margin + markLength, margin);
            pdf.line(margin, margin - markLength, margin, margin + markLength);

            // Rechtsbovenhoek
            pdf.line(pageWidth - margin - markLength, margin, pageWidth - margin + markLength, margin);
            pdf.line(pageWidth - margin, margin - markLength, pageWidth - margin, margin + markLength);

            // Linksonderhoek
            pdf.line(margin - markLength, pageHeight - margin, margin + markLength, pageHeight - margin);
            pdf.line(margin, pageHeight - margin - markLength, margin, pageHeight - margin + markLength);

            // Rechtsonderhoek
            pdf.line(pageWidth - margin - markLength, pageHeight - margin, pageWidth - margin + markLength, pageHeight - margin);
            pdf.line(pageWidth - margin, pageHeight - margin - markLength, pageWidth - margin, pageHeight - margin + markLength);

            pdf.setLineDash([]);
          }

          resolve();
        };
        img.src = image;
      });
    }
  }

  return pdf;
};

// Functie om afbeelding te laden als dataURL
// Nieuwe parameter 'addWhiteBackground' toegevoegd om te bepalen of een witte achtergrond moet worden toegevoegd
const loadImageAsDataURL = (url, addWhiteBackground = true) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Alleen witte achtergrond toevoegen als addWhiteBackground true is
      // Voor het watermerk willen we de transparantie behouden
      if (addWhiteBackground) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to load image: ' + url));
    };
    img.src = url;
  });
};