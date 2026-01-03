import { 
  sanitizeFilename,
  generatePOAFilename,
  generateBlobPath,
  validateFileSize,
  validateFileType,
  validateUpload
} from '../storage';

console.log('=== Storage Library Tests ===\n');

// Test 1: Filename Sanitization
console.log('Test 1: Filename Sanitization');
const unsafeFilename = 'John\'s POA (2024) #1!@#$%^&*.pdf';
const safe = sanitizeFilename(unsafeFilename);
console.log('Input:', unsafeFilename);
console.log('Output:', safe);
console.log('Safe filename:', /^[a-z0-9._-]+$/.test(safe) ? '✅ PASSED' : '❌ FAILED');

// Test 2: POA Filename Generation
console.log('\nTest 2: POA Filename Generation');
const filename = generatePOAFilename({
  type: 'financial',
  principalName: 'John Doe',
  state: 'FL',
  timestamp: new Date('2024-01-03')
});
console.log('Generated:', filename);
console.log('Format correct:', filename.startsWith('poa_financial_fl_john_doe_20240103_') ? '✅ PASSED' : '❌ FAILED');
console.log('Has random suffix:', filename.split('_').length === 6 ? '✅ PASSED' : '❌ FAILED');

// Test 3: Blob Path Generation
console.log('\nTest 3: Blob Path Generation');
const path = generateBlobPath({
  tenantId: 'tenant-123',
  poaId: 'poa-456',
  filename: 'test.pdf'
});
console.log('Generated:', path);
console.log('Correct format:', path === 'poa/tenant-123/poa-456/test.pdf' ? '✅ PASSED' : '❌ FAILED');

// Test 4: File Size Validation
console.log('\nTest 4: File Size Validation');
const smallBuffer = Buffer.alloc(1024 * 1024); // 1MB
const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB

console.log('1MB file (< 4.5MB limit):', validateFileSize(smallBuffer) ? '✅ PASSED' : '❌ FAILED');
console.log('5MB file (> 4.5MB limit):', validateFileSize(largeBuffer) ? '❌ FAILED (expected)' : '✅ PASSED');

// Test 5: File Type Validation
console.log('\nTest 5: File Type Validation');
console.log('PDF type:', validateFileType('application/pdf') ? '✅ PASSED' : '❌ FAILED');
console.log('Octet stream:', validateFileType('application/octet-stream') ? '✅ PASSED' : '❌ FAILED');
console.log('Text type:', validateFileType('text/plain') ? '❌ FAILED (expected)' : '✅ PASSED');

// Test 6: Pre-upload Validation
console.log('\nTest 6: Pre-upload Validation');
const validFile = Buffer.alloc(1024 * 1024); // 1MB
const validResult = validateUpload({
  file: validFile,
  contentType: 'application/pdf'
});
console.log('Valid upload:', validResult.valid ? '✅ PASSED' : '❌ FAILED');

const oversizedFile = Buffer.alloc(5 * 1024 * 1024); // 5MB
const oversizedResult = validateUpload({
  file: oversizedFile,
  contentType: 'application/pdf'
});
console.log('Oversized file:', oversizedResult.valid ? '❌ FAILED' : '✅ PASSED');
console.log('Error message:', oversizedResult.error);

const wrongType = validateUpload({
  file: validFile,
  contentType: 'text/plain'
});
console.log('Wrong file type:', wrongType.valid ? '❌ FAILED' : '✅ PASSED');
console.log('Error message:', wrongType.error);

console.log('\n=== Storage Tests Complete ===');
