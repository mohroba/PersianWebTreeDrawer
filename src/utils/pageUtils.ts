import { PageSize, Orientation, PageConfig } from '../types';

export const DPI = 96;
export const MM_TO_PX = DPI / 25.4; // 1 inch = 25.4 mm

export interface Dimension {
  width: number; // in mm
  height: number; // in mm
}

export const PAGE_DIMENSIONS: Record<Exclude<PageSize, 'Custom'>, Dimension> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  B5: { width: 175, height: 250 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

/**
 * Gets page size in pixels for a given config and orientation
 */
export const getPageSizePx = (size: PageSize, orientation: Orientation, config?: PageConfig) => {
  if (size === 'Custom' && config) {
    const w = config.customWidth || 210;
    const h = config.customHeight || 297;
    const width = orientation === 'portrait' ? w : h;
    const height = orientation === 'portrait' ? h : w;
    return {
      width: Math.round(width * MM_TO_PX),
      height: Math.round(height * MM_TO_PX),
    };
  }

  const dim = PAGE_DIMENSIONS[size as keyof typeof PAGE_DIMENSIONS] || PAGE_DIMENSIONS.A4;
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
export const formatDimensions = (size: PageSize, orientation: Orientation, config?: PageConfig): string => {
  if (size === 'Custom') {
    const w = config?.customWidth || 210;
    const h = config?.customHeight || 297;
    const width = orientation === 'portrait' ? w : h;
    const height = orientation === 'portrait' ? h : w;
    return `Custom (${width}mm × ${height}mm)`;
  }
  const dim = PAGE_DIMENSIONS[size as keyof typeof PAGE_DIMENSIONS];
  const w = orientation === 'portrait' ? dim.width : dim.height;
  const h = orientation === 'portrait' ? dim.height : dim.width;
  return `${size} (${w}mm × ${h}mm)`;
};
