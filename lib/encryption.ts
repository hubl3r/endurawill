/**
 * Encryption Utility for Sensitive Account Data
 * 
 * Uses AES-256-GCM encryption for:
 * - Login credentials (username, password)
 * - Account numbers
 * - Routing numbers
 * - VINs
 * - Policy numbers
 * 
 * Environment Variable Required:
 * ENCRYPTION_KEY - 256-bit (32-byte) base64-encoded key
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM mode
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment variable
 * Throws error if not configured
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  try {
    // Decode base64 key
    const keyBuffer = Buffer.from(key, 'base64');
    
    if (keyBuffer.length !== KEY_LENGTH) {
      throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (256 bits)`);
    }
    
    return keyBuffer;
  } catch (error) {
    throw new Error('Invalid ENCRYPTION_KEY format. Must be base64-encoded 256-bit key');
  }
}

/**
 * Generate a new encryption key (for initial setup)
 * Run this once and store the result in ENCRYPTION_KEY env var
 */
export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  return key.toString('base64');
}

/**
 * Encrypt a string value
 * Returns: iv:authTag:encryptedData (all base64 encoded, colon-separated)
 */
export function encrypt(text: string): string {
  if (!text) return text; // Don't encrypt empty strings
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string value
 * Expects format: iv:authTag:encryptedData
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText; // Don't decrypt empty strings
  
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt multiple fields in an object
 * Returns new object with encrypted fields
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fieldsToEncrypt) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as T[keyof T];
    }
  }
  
  return result;
}

/**
 * Decrypt multiple fields in an object
 * Returns new object with decrypted fields
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fieldsToDecrypt) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = decrypt(result[field] as string) as T[keyof T];
      } catch (error) {
        // If decryption fails, field might not be encrypted (legacy data)
        console.warn(`Failed to decrypt field ${String(field)}, using as-is`);
      }
    }
  }
  
  return result;
}

/**
 * Check if a string appears to be encrypted
 * (Has the iv:authTag:data format)
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 3;
}

// ==================== USAGE EXAMPLES ====================

/**
 * Example: Encrypting account data before saving to database
 * 
 * import { encryptFields } from '@/lib/encryption';
 * 
 * const accountData = {
 *   accountName: "Main Checking",
 *   loginUsername: "user@example.com",
 *   loginPassword: "secret123",
 *   notes: "My primary account"
 * };
 * 
 * const encrypted = encryptFields(accountData, ['loginUsername', 'loginPassword']);
 * // encrypted.loginUsername and loginPassword are now encrypted
 * 
 * await prisma.account.create({ data: encrypted });
 */

/**
 * Example: Decrypting account data after fetching from database
 * 
 * import { decryptFields } from '@/lib/encryption';
 * 
 * const account = await prisma.account.findUnique({ where: { id } });
 * 
 * const decrypted = decryptFields(account, ['loginUsername', 'loginPassword']);
 * // decrypted.loginUsername and loginPassword are now readable
 * 
 * return decrypted;
 */

/**
 * Example: Financial account details
 * 
 * const financialData = {
 *   accountNumber: "123456789",
 *   routingNumber: "987654321",
 *   currentBalance: 5000.00
 * };
 * 
 * const encrypted = encryptFields(financialData, ['accountNumber', 'routingNumber']);
 * await prisma.financialAccountDetails.create({ data: encrypted });
 */
