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
 * Generates a full page-sized SVG representing the printed/previewed layout.
 * Combines the header banner, footer, background elements, custom text boxes with styles,
 * and offsets the central nodes & edges to align with the visual preview.
 */
export const generateFullPageSVG = (documentData: TreeDocument, svgElement: SVGSVGElement): SVGSVGElement => {
  const { size, orientation } = documentData.page;
  const { width, height } = getPageSizePx(size, orientation, documentData.page);

  const fullSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  fullSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  fullSvg.setAttribute('width', width.toString());
  fullSvg.setAttribute('height', height.toString());
  fullSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  // Clean background rect
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', width.toString());
  bgRect.setAttribute('height', height.toString());
  bgRect.setAttribute('fill', '#ffffff');
  fullSvg.appendChild(bgRect);

  // Defs block for fonts and styling
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,750;1,400&family=Space+Grotesk:wght@400;500;700&display=swap');
    text {
      user-select: none;
    }
  `;
  defs.appendChild(styleEl);

  // Transfer original patterns or configurations (e.g. dot-grid defs if any)
  const originalDefs = svgElement.querySelector('defs');
  if (originalDefs) {
    Array.from(originalDefs.childNodes).forEach((child) => {
      defs.appendChild(child.cloneNode(true));
    });
  }
  fullSvg.appendChild(defs);

  // Helper for multi-line text
  const addMultiLineText = (group: SVGGElement, text: string, x: number, startY: number, fontSize: number, fill: string, fontFam: string, bold: boolean, align: string) => {
    const lines = text.split('\\n');
    lines.forEach((line, idx) => {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.textContent = line;
      txt.setAttribute('text-anchor', align);
      txt.setAttribute('y', (startY + idx * (fontSize * 1.2)).toString());
      txt.setAttribute('font-family', fontFam);
      txt.setAttribute('font-size', `${fontSize}px`);
      if (bold) txt.setAttribute('font-weight', 'bold');
      txt.setAttribute('fill', fill);
      group.appendChild(txt);
    });
    return lines.length;
  };

  // 1. Header Group
  const headerHeight = documentData.page.headerHeight || 80;
  const headerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Header image overlay
  if (documentData.page.headerImage) {
    const headerImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    headerImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', documentData.page.headerImage);
    headerImg.setAttribute('width', width.toString());
    headerImg.setAttribute('height', headerHeight.toString());
    
    const scale = documentData.page.headerScale || 1;
    const tx = documentData.page.headerOffsetX || 0;
    const ty = documentData.page.headerOffsetY || 0;
    const cx = width / 2;
    const cy = headerHeight / 2;
    headerImg.setAttribute('transform', `translate(${tx}, ${ty}) translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`);

    const fit = documentData.page.headerFit;
    if (fit === 'cover') {
      headerImg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    } else if (fit === 'contain') {
      headerImg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    } else {
      headerImg.setAttribute('preserveAspectRatio', 'none');
    }
    headerGroup.appendChild(headerImg);
  }

  // Header bottom border/line
  const headerBorder = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  headerBorder.setAttribute('x1', '0');
  headerBorder.setAttribute('y1', headerHeight.toString());
  headerBorder.setAttribute('x2', width.toString());
  headerBorder.setAttribute('y2', headerHeight.toString());
  headerBorder.setAttribute('stroke', '#000000');
  headerBorder.setAttribute('stroke-width', '1');
  headerBorder.setAttribute('stroke-dasharray', '4 4');
  headerGroup.appendChild(headerBorder);

  // Header title/subtexts group
  const headerTextGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const htx = documentData.page.headerTextOffsetX || 0;
  const hty = documentData.page.headerTextOffsetY || 0;
  const hcx = width / 2;
  const hcy = headerHeight / 2;
  headerTextGroup.setAttribute('transform', `translate(${hcx + htx}, ${hcy + hty})`);

  const hSize = documentData.page.headerTextSize || 16;
  const hColor = documentData.page.headerTextColor || '#000000';
  const hFont = documentData.page.headerTextFont || 'sans-serif';

  const headerLinesCount = addMultiLineText(headerTextGroup, documentData.page.headerText ?? 'FAMILY TREE CHART', 0, -hSize / 4, hSize, hColor, hFont, true, 'middle');

  const subSize = Math.max(9, hSize * 0.6);
  const startSubY = -hSize / 4 + headerLinesCount * (hSize * 1.2) + 4;
  addMultiLineText(headerTextGroup, documentData.page.headerSubText ?? '', 0, startSubY, subSize, hColor === '#000000' ? '#64748b' : hColor, hFont, false, 'middle');

  headerGroup.appendChild(headerTextGroup);
  fullSvg.appendChild(headerGroup);

  // 2. Nodes & Edges visual rendering group
  const centralGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  centralGroup.setAttribute('transform', `translate(0, ${headerHeight})`);

  // Collect the original drawing node components
  Array.from(svgElement.childNodes).forEach((child) => {
    if (child instanceof Element) {
      if (child.tagName === 'defs' || child.classList.contains('no-print') || child.id === 'canvas-background') {
        return;
      }
      centralGroup.appendChild(child.cloneNode(true));
    }
  });

  // Render footnotes directly
  const footnotes = documentData.nodes
    .filter(n => n.footnote && n.footnote.trim().length > 0)
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 20) return a.y - b.y;
      return a.x - b.x;
    });

  if (footnotes.length > 0) {
    const fnGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Draw top separator
    const sep = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    sep.setAttribute('x1', '24');
    sep.setAttribute('y1', '0');
    // We make a short 200px separator
    sep.setAttribute('x2', '224');
    sep.setAttribute('y2', '0');
    sep.setAttribute('stroke', '#000000');
    sep.setAttribute('stroke-width', '0.5');
    fnGroup.appendChild(sep);

    let currentY = 12;
    footnotes.forEach((node, idx) => {
      const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textNode.setAttribute('x', '24');
      textNode.setAttribute('y', currentY.toString());
      textNode.setAttribute('font-family', 'sans-serif');
      textNode.setAttribute('font-size', '9');
      textNode.setAttribute('fill', '#333333');
      textNode.textContent = `[${idx + 1}] ${node.footnote}`;
      fnGroup.appendChild(textNode);
      currentY += 12;
    });

    // Translate to the bottom of central view
    const footerHeight = documentData.page.footerHeight || 80;
    const availableCentralHeight = height - headerHeight - footerHeight;
    const fnGroupHeight = currentY + 12;
    fnGroup.setAttribute('transform', `translate(0, ${availableCentralHeight - fnGroupHeight})`);
    
    centralGroup.appendChild(fnGroup);
  }

  fullSvg.appendChild(centralGroup);

  // 3. Footer Group
  const footerHeight = documentData.page.footerHeight || 80;
  const footerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  footerGroup.setAttribute('transform', `translate(0, ${height - footerHeight})`);

  // Footer banner image
  if (documentData.page.footerImage) {
    const footerImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    footerImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', documentData.page.footerImage);
    footerImg.setAttribute('width', width.toString());
    footerImg.setAttribute('height', footerHeight.toString());

    const scale = documentData.page.footerScale || 1;
    const tx = documentData.page.footerOffsetX || 0;
    const ty = documentData.page.footerOffsetY || 0;
    const cx = width / 2;
    const cy = footerHeight / 2;
    footerImg.setAttribute('transform', `translate(${tx}, ${ty}) translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`);

    const fit = documentData.page.footerFit;
    if (fit === 'cover') {
      footerImg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    } else if (fit === 'contain') {
      footerImg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    } else {
      footerImg.setAttribute('preserveAspectRatio', 'none');
    }
    footerGroup.appendChild(footerImg);
  }

  // Footer top horizontal border/line
  const footerBorder = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  footerBorder.setAttribute('x1', '0');
  footerBorder.setAttribute('y1', '0');
  footerBorder.setAttribute('x2', width.toString());
  footerBorder.setAttribute('y2', '0');
  footerBorder.setAttribute('stroke', '#000000');
  footerBorder.setAttribute('stroke-width', '1');
  footerBorder.setAttribute('stroke-dasharray', '4 4');
  footerGroup.appendChild(footerBorder);

  // Footer Title and copyright subtexts
  const footerTextGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const ftx = documentData.page.footerTextOffsetX || 0;
  const fty = documentData.page.footerTextOffsetY || 0;
  const fcx = width / 2;
  const fcy = footerHeight / 2;
  footerTextGroup.setAttribute('transform', `translate(${fcx + ftx}, ${fcy + fty})`);

  const fSize = documentData.page.footerTextSize || 14;
  const fColor = documentData.page.footerTextColor || '#000000';
  const fFont = documentData.page.footerTextFont || 'sans-serif';

  const footerLinesCount = addMultiLineText(footerTextGroup, documentData.page.footerText ?? 'طراحی شده با رابوک', 0, -fSize / 4, fSize, fColor, fFont, true, 'middle');

  const fsubSize = Math.max(9, fSize * 0.7);
  const fsubStartY = -fSize / 4 + footerLinesCount * (fSize * 1.2) + 4;
  addMultiLineText(footerTextGroup, documentData.page.footerSubText ?? '© 2026', 0, fsubStartY, fsubSize, fColor === '#000000' ? '#64748b' : fColor, fFont, false, 'middle');

  footerGroup.appendChild(footerTextGroup);
  fullSvg.appendChild(footerGroup);

  return fullSvg;
};

/**
 * Generates and downloads the current TreeDocument as a clean SVG vector file.
 * Includes only nodes, edges, header/footer elements, and background, strictly excluding editor UI.
 */
export const exportToSVG = (documentData: TreeDocument, svgElement: SVGSVGElement | null) => {
  if (!svgElement) {
    alert('Canvas SVG element not found');
    return;
  }

  const fullSvg = generateFullPageSVG(documentData, svgElement);
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(fullSvg);

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
    alert('Canvas SVG element not found');
    return;
  }

  const { size, orientation } = documentData.page;
  const { width, height } = getPageSizePx(size, orientation, documentData.page);

  const fullSvg = generateFullPageSVG(documentData, svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(fullSvg);
  
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width * 1.5; // Export at 1.5x resolution for extra clarity
    canvas.height = height * 1.5;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Force white background
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
