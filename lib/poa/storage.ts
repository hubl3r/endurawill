// lib/poa/storage.ts
// Vercel Blob storage functions for POA documents

import { put, del, head } from '@vercel/blob';

// ============================================
// TYPES
// ============================================

export interface UploadPOADocumentParams {
  file: Buffer | Blob | File;
  filename: string;
  contentType?: string;
  tenantId: string;
  poaId: string;
}

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

// ============================================
// FILENAME HELPERS
// ============================================

/**
 * Sanitize filename for safe storage
 * Removes special characters, limits length
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[._]+|[._]+$/g, '') // Remove leading/trailing dots and underscores
    .toLowerCase()
    .substring(0, 100); // Limit length
}

/**
 * Generate POA document filename
 * Format: poa_{type}_{principalName}_{date}_{random}.pdf
 */
export function generatePOAFilename(params: {
  type: 'financial' | 'healthcare';
  principalName: string;
  state: string;
  timestamp?: Date;
}): string {
  const { type, principalName, state, timestamp = new Date() } = params;
  
  // Sanitize principal name
  const sanitizedName = sanitizeFilename(principalName.replace(/\s+/g, '_'));
  
  // Format date as YYYYMMDD
  const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Generate random suffix (6 chars)
  const random = Math.random().toString(36).substring(2, 8);
  
  return `poa_${type}_${state.toLowerCase()}_${sanitizedName}_${dateStr}_${random}.pdf`;
}

/**
 * Generate blob path with tenant organization
 * Format: poa/{tenantId}/{poaId}/{filename}
 */
export function generateBlobPath(params: {
  tenantId: string;
  poaId: string;
  filename: string;
}): string {
  const { tenantId, poaId, filename } = params;
  return `poa/${tenantId}/${poaId}/${filename}`;
}

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload POA document to Vercel Blob storage
 * 
 * @param params - Upload parameters
 * @returns Upload result with URL
 * 
 * @example
 * ```typescript
 * const result = await uploadPOADocument({
 *   file: pdfBuffer,
 *   filename: 'poa_durable_john_doe_20240103.pdf',
 *   contentType: 'application/pdf',
 *   tenantId: 'tenant-123',
 *   poaId: 'poa-456'
 * });
 * console.log('PDF URL:', result.url);
 * ```
 */
export async function uploadPOADocument(
  params: UploadPOADocumentParams
): Promise<UploadResult> {
  const { file, filename, contentType = 'application/pdf', tenantId, poaId } = params;

  try {
    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(filename);

    // Generate blob path
    const pathname = generateBlobPath({
      tenantId,
      poaId,
      filename: sanitizedFilename,
    });

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public', // POAs need to be downloadable by principals/agents
      contentType,
      addRandomSuffix: false, // We already added random suffix in filename
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || contentType,
      contentDisposition: `attachment; filename="${sanitizedFilename}"`,
    };
  } catch (error) {
    console.error('Error uploading POA document:', error);
    throw new Error(`Failed to upload POA document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload signed POA document (after execution)
 * Creates a separate file for the signed version
 */
export async function uploadSignedPOADocument(params: {
  file: Buffer | Blob | File;
  originalFilename: string;
  tenantId: string;
  poaId: string;
}): Promise<UploadResult> {
  const { file, originalFilename, tenantId, poaId } = params;

  // Insert '_signed' before .pdf extension
  const signedFilename = originalFilename.replace(/\.pdf$/, '_signed.pdf');

  return uploadPOADocument({
    file,
    filename: signedFilename,
    contentType: 'application/pdf',
    tenantId,
    poaId,
  });
}

// ============================================
// DELETION FUNCTIONS
// ============================================

/**
 * Delete POA document from Vercel Blob storage
 * Use when POA is revoked or needs to be regenerated
 */
export async function deletePOADocument(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting POA document:', error);
    throw new Error(`Failed to delete POA document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete all documents for a POA (original + signed versions)
 */
export async function deleteAllPOADocuments(urls: string[]): Promise<void> {
  try {
    await Promise.all(urls.map(url => del(url)));
  } catch (error) {
    console.error('Error deleting POA documents:', error);
    throw new Error(`Failed to delete POA documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// RETRIEVAL FUNCTIONS
// ============================================

/**
 * Check if POA document exists in blob storage
 */
export async function poaDocumentExists(url: string): Promise<boolean> {
  try {
    await head(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get POA document metadata
 */
export async function getPOADocumentMetadata(url: string) {
  try {
    const metadata = await head(url);
    return {
      url,
      size: metadata.size,
      uploadedAt: metadata.uploadedAt,
      contentType: metadata.contentType,
    };
  } catch (error) {
    console.error('Error getting POA document metadata:', error);
    throw new Error(`Failed to get POA document metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Upload multiple POA documents (e.g., healthcare + financial)
 */
export async function uploadMultiplePOADocuments(
  documents: Array<UploadPOADocumentParams>
): Promise<UploadResult[]> {
  try {
    const results = await Promise.all(
      documents.map(doc => uploadPOADocument(doc))
    );
    return results;
  } catch (error) {
    console.error('Error uploading multiple POA documents:', error);
    throw new Error(`Failed to upload multiple POA documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// STORAGE LIMITS & VALIDATION
// ============================================

/**
 * Validate file size (Vercel Blob has limits)
 * Free tier: 500MB total, 4.5MB per file
 * Pro tier: Configurable
 */
export function validateFileSize(file: Buffer | Blob | File, maxSizeMB: number = 4.5): boolean {
  let fileSizeBytes: number;
  
  if (file instanceof Buffer) {
    fileSizeBytes = file.length;
  } else if ('size' in file) {
    fileSizeBytes = file.size;
  } else {
    // Fallback for unknown types
    fileSizeBytes = 0;
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSizeBytes <= maxSizeBytes;
}

/**
 * Validate file type (should be PDF)
 */
export function validateFileType(contentType: string): boolean {
  return contentType === 'application/pdf' || contentType === 'application/octet-stream';
}

/**
 * Pre-upload validation
 */
export function validateUpload(params: {
  file: Buffer | Blob | File;
  contentType?: string;
  maxSizeMB?: number;
}): { valid: boolean; error?: string } {
  const { file, contentType = 'application/pdf', maxSizeMB = 4.5 } = params;

  // Check file size
  if (!validateFileSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  if (!validateFileType(contentType)) {
    return {
      valid: false,
      error: 'Only PDF files are allowed',
    };
  }

  return { valid: true };
}
