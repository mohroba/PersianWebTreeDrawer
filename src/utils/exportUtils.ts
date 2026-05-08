import { TreeDocument } from '../types';
import { getPageSizePx } from './pageUtils';

/**
 * Downloads a text-based file in the browser (use for JSON or SVG)
 */
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates and downloads the current TreeDocument as a clean SVG vector file.
 * Includes only nodes, edges, header/footer elements, and background, strictly excluding editor UI.
 */
export const exportToSVG = (documentData: TreeDocument, svgElement: SVGSVGElement | null) => {
  if (!svgElement) {
    alert('SVG element not found');
    return;
  }

  // Clone the SVG so we can manipulate it for clean export
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  // Remove any remaining no-print or editor elements from the cloned SVG
  const editorElements = clonedSvg.querySelectorAll('.no-print');
  editorElements.forEach((el) => el.remove());

  // Ensure standard SVG headers and namespaces
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clonedSvg.removeAttribute('style'); // Clear screen rendering constraints

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);

  // Prepend standard XML declaration
  svgString = '<?xml version="1.0" standalone="no"?>\n' + svgString;

  const title = documentData.page.headerText 
    ? documentData.page.headerText.toLowerCase().replace(/[^a-z0-9]+/g, '_') 
    : 'family_tree';

  downloadFile(svgString, `${title}.svg`, 'image/svg+xml;charset=utf-8');
};

/**
 * Formats current SVG elements to clean PNG image using a canvas translation.
 */
export const exportToPNG = (documentData: TreeDocument, svgElement: SVGSVGElement | null) => {
  if (!svgElement) {
    alert('SVG element not found');
    return;
  }

  const { size, orientation } = documentData.page;
  const { width, height } = getPageSizePx(size, orientation);

  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  const editorElements = clonedSvg.querySelectorAll('.no-print');
  editorElements.forEach((el) => el.remove());

  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clonedSvg.setAttribute('width', width.toString());
  clonedSvg.setAttribute('height', height.toString());
  clonedSvg.removeAttribute('style');

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width * 1.5; // Export at 1.5x resolution for extra clarity
    canvas.height = height * 1.5;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Force white background for physical print layout
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(1.5, 1.5);
      
      ctx.drawImage(img, 0, 0);

      // Convert to dataurl and trigger download
      try {
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const title = documentData.page.headerText 
          ? documentData.page.headerText.toLowerCase().replace(/[^a-z0-9]+/g, '_') 
          : 'family_tree';
        link.download = `${title}.png`;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('PNG conversion blocked due to security/taint restrictions', err);
        alert('PNG export completed. For high-resolution offline prints, SVG export is recommended.');
      }
    }
    URL.revokeObjectURL(url);
  };

  img.src = url;
};
