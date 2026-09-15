/**
 * Immich REST API Client
 *
 * Typed client for interacting with the Immich REST API.
 * Base URL and API key are loaded from environment variables.
 */

export interface ImmichAsset {
  id: string;
  type: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  hasOriginal?: boolean;
  checksum: string;
  fileOrigin: string;
  createdAt: string;
  modifiedAt: string;
  thumbhash?: string;
  livePhotoData?: {
    videoId: string;
  };
  exifInfo?: {
    iso?: number;
    make?: string;
    model?: string;
    dateTime?: string;
    dateTimeOriginal?: string;
    lensModel?: string;
    focalLength?: number;
    aperture?: number;
    exposureTime?: number;
    fNumber?: number;
    exposureBias?: number;
    orientation?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  personIds: string[];
  albumIds: string[];
  stackIds: string[];
  tagIds: string[];
  smartAlbumIds: string[];
  isFavorite: boolean;
  isArchived: boolean;
  isVisible: boolean;
  isHidden: boolean;
}

export interface ImmichThumbnailOptions {
  /**
   * Thumbnail size preset
   * - small: 144x144
   * - medium: 480x480
   * - large: 1080x1080
   * - full: Original resolution (if available)
   */
  size?: 'small' | 'medium' | 'large' | 'full';
}

/**
 * Fetch a single asset by ID with full EXIF data
 */
export async function getAssetById(assetId: string): Promise<ImmichAsset> {
  const baseUrl = process.env.IMMICH_BASE_URL || 'http://localhost:3003';
  const apiKey = process.env.IMMICH_API_KEY;

  if (!apiKey) {
    throw new Error('IMMICH_API_KEY environment variable is not set');
  }

  const response = await fetch(`${baseUrl}/api/assets/${assetId}`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch asset ${assetId}: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Get a thumbnail for an asset
 * @param assetId - The Immich asset ID
 * @param options - Thumbnail size options
 * @returns Promise that resolves to the thumbnail image data (Buffer)
 */
export async function getAssetThumbnail(
  assetId: string,
  options: ImmichThumbnailOptions = {}
): Promise<Buffer> {
  const baseUrl = process.env.IMMICH_BASE_URL || 'http://localhost:3003';
  const apiKey = process.env.IMMICH_API_KEY;

  if (!apiKey) {
    throw new Error('IMMICH_API_KEY environment variable is not set');
  }

  // Build query parameters
  const params = new URLSearchParams();
  if (options.size) {
    params.set('size', options.size);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${baseUrl}/api/assets/${assetId}/thumbnail?${queryString}`
    : `${baseUrl}/api/assets/${assetId}/thumbnail`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch thumbnail for asset ${assetId}: ${response.status} ${error}`);
  }

  // Convert response to buffer
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get the original image for an asset
 * @param assetId - The Immich asset ID
 * @returns Promise that resolves to the original image data (Buffer)
 */
export async function getAssetOriginal(assetId: string): Promise<Buffer> {
  const baseUrl = process.env.IMMICH_BASE_URL || 'http://localhost:3003';
  const apiKey = process.env.IMMICH_API_KEY;

  if (!apiKey) {
    throw new Error('IMMICH_API_KEY environment variable is not set');
  }

  const response = await fetch(`${baseUrl}/api/assets/${assetId}/original`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch original image for asset ${assetId}: ${response.status} ${error}`);
  }

  // Convert response to buffer
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get an asset thumbnail as a base64 encoded string
 * Useful for embedding images directly in HTML or JSON responses
 */
export async function getAssetThumbnailBase64(
  assetId: string,
  options: ImmichThumbnailOptions = {}
): Promise<string> {
  const thumbnail = await getAssetThumbnail(assetId, options);

  // Convert to base64
  return `data:image/jpeg;base64,${thumbnail.toString('base64')}`;
}

/**
 * Get an asset original image as a base64 encoded string
 */
export async function getAssetOriginalBase64(assetId: string): Promise<string> {
  const original = await getAssetOriginal(assetId);

  // Convert to base64
  return `data:image/jpeg;base64,${original.toString('base64')}`;
}
