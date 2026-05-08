import { PageSize, Orientation } from '../types';

export const DPI = 96;
export const MM_TO_PX = DPI / 25.4; // 1 inch = 25.4 mm

export interface Dimension {
  width: number; // in mm
  height: number; // in mm
}

export const PAGE_DIMENSIONS: Record<PageSize, Dimension> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

/**
 * Gets page size in pixels for a given standard size and orientation
 */
export const getPageSizePx = (size: PageSize, orientation: Orientation) => {
  const dim = PAGE_DIMENSIONS[size];
  const w = orientation === 'portrait' ? dim.width : dim.height;
  const h = orientation === 'portrait' ? dim.height : dim.width;
  return {
    width: Math.round(w * MM_TO_PX),
    height: Math.round(h * MM_TO_PX),
  };
};

/**
 * Formats standard measurements back to readable strings
 */
export const formatDimensions = (size: PageSize, orientation: Orientation): string => {
  const dim = PAGE_DIMENSIONS[size];
  const w = orientation === 'portrait' ? dim.width : dim.height;
  const h = orientation === 'portrait' ? dim.height : dim.width;
  return `${size} (${w}mm × ${h}mm)`;
};
