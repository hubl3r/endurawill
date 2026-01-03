// app/api/admin/test-phase2/route.ts
import { NextResponse } from 'next/client';
import { 
  validateFinancialPOA, 
  validateHealthcarePOA,
  validateUniqueAgentEmail,
  validateAgentOrder 
} from '@/lib/poa/validation';
import { 
  sanitizeFilename,
  generatePOAFilename,
  generateBlobPath,
  validateFileSize,
  validateFileType,
  validateUpload
} from '@/lib/poa/storage';
import { generateFinancialPOAPDF, generateHealthcarePOAPDF } from '@/lib/poa/pdf-generator';

export async function POST(request: Request) {
  const { testType } = await request.json();

  const results: any[] = [];

  try {
    // ============================================
    // VALIDATION TESTS
    // ============================================
    if (testType === 'validation' || testType === 'all') {
      results.push({ category: 'Validation Tests', tests: [] });

      // Test 1: Valid Durable POA
      const validDurablePOA = {
        principal: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          tenantId: '123e4567-e89b-12d3-a456-426614174001',
          fullName: 'John Doe',
          email: 'john@example.com',
          address: {
            street: '123 Main St',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101'
          }
        },
        poaType: 'durable' as const,
        state: 'FL',
        isDurable: true,
        isSpringing: false,
        isLimited: false,
        agents: [
          {
            type: 'primary' as const,
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            address: {
              street: '456 Oak Ave',
              city: 'Miami',
              state: 'FL',
              zipCode: '33102'
            }
          }
        ],
        grantedPowers: {
          categoryIds: ['123e4567-e89b-12d3-a456-426614174002'],
          grantAllSubPowers: true
        }
      };

      const result1 = validateFinancialPOA(validDurablePOA);
      results[results.length - 1].tests.push({
        name: 'Valid Durable POA',
        passed: result1.success,
        message: result1.success ? 'Valid POA accepted' : 'Validation failed',
        error: result1.success ? null : result1.error.errors[0]?.message
      });

      // Test 2: Missing Required Fields
      const result2 = validateFinancialPOA({ principal: { fullName: 'Test' } });
      results[results.length - 1].tests.push({
        name: 'Missing Required Fields',
        passed: !result2.success,
        message: !result2.success ? 'Correctly rejected invalid input' : 'Should have rejected',
        error: null
      });

      // Test 3: Invalid Email
      const invalidEmail = {
        ...validDurablePOA,
        principal: { ...validDurablePOA.principal, email: 'not-an-email' }
      };
      const result3 = validateFinancialPOA(invalidEmail);
      results[results.length - 1].tests.push({
        name: 'Invalid Email',
        passed: !result3.success,
        message: !result3.success ? 'Correctly rejected invalid email' : 'Should have rejected',
        error: null
      });

      // Test 4: Invalid ZIP
      const invalidZip = {
        ...validDurablePOA,
        principal: {
          ...validDurablePOA.principal,
          address: { ...validDurablePOA.principal.address, zipCode: '123' }
        }
      };
      const result4 = validateFinancialPOA(invalidZip);
      results[results.length - 1].tests.push({
        name: 'Invalid ZIP Code',
        passed: !result4.success,
        message: !result4.success ? 'Correctly rejected invalid ZIP' : 'Should have rejected',
        error: null
      });

      // Test 5: Springing Without Physicians
      const springingNoDocs = {
        ...validDurablePOA,
        isSpringing: true
      };
      const result5 = validateFinancialPOA(springingNoDocs);
      results[results.length - 1].tests.push({
        name: 'Springing POA Without Physicians',
        passed: !result5.success,
        message: !result5.success ? 'Correctly rejected springing without physicians' : 'Should have rejected',
        error: null
      });

      // Test 6: Valid Springing
      const validSpringing = {
        ...validDurablePOA,
        state: 'TX',
        isSpringing: true,
        springingCondition: 'Incapacity as certified by physician',
        numberOfPhysiciansRequired: 1
      };
      const result6 = validateFinancialPOA(validSpringing);
      results[results.length - 1].tests.push({
        name: 'Valid Springing POA',
        passed: result6.success,
        message: result6.success ? 'Valid springing POA accepted' : 'Should have passed',
        error: null
      });

      // Test 7: Agent Email Uniqueness
      const uniqueTest = validateUniqueAgentEmail([
        { email: 'agent1@example.com' },
        { email: 'agent2@example.com' }
      ]);
      results[results.length - 1].tests.push({
        name: 'Unique Agent Emails',
        passed: uniqueTest.success,
        message: uniqueTest.success ? 'Unique emails validated' : 'Should have passed',
        error: null
      });

      const duplicateTest = validateUniqueAgentEmail([
        { email: 'agent1@example.com' },
        { email: 'agent1@example.com' }
      ]);
      results[results.length - 1].tests.push({
        name: 'Duplicate Agent Emails',
        passed: !duplicateTest.success,
        message: !duplicateTest.success ? 'Correctly rejected duplicates' : 'Should have rejected',
        error: null
      });
    }

    // ============================================
    // STORAGE TESTS
    // ============================================
    if (testType === 'storage' || testType === 'all') {
      results.push({ category: 'Storage Tests', tests: [] });

      // Test 1: Filename Sanitization
      const unsafe = 'John\'s POA (2024) #1!@#$%^&*.pdf';
      const safe = sanitizeFilename(unsafe);
      const isSafe = /^[a-z0-9._-]+$/.test(safe);
      results[results.length - 1].tests.push({
        name: 'Filename Sanitization',
        passed: isSafe,
        message: `"${unsafe}" → "${safe}"`,
        error: null
      });

      // Test 2: POA Filename Generation
      const filename = generatePOAFilename({
        type: 'financial',
        principalName: 'John Doe',
        state: 'FL',
        timestamp: new Date('2024-01-03')
      });
      const correctFormat = filename.startsWith('poa_financial_fl_john_doe_20240103_');
      results[results.length - 1].tests.push({
        name: 'POA Filename Generation',
        passed: correctFormat,
        message: `Generated: ${filename}`,
        error: null
      });

      // Test 3: Blob Path Generation
      const path = generateBlobPath({
        tenantId: 'tenant-123',
        poaId: 'poa-456',
        filename: 'test.pdf'
      });
      const correctPath = path === 'poa/tenant-123/poa-456/test.pdf';
      results[results.length - 1].tests.push({
        name: 'Blob Path Generation',
        passed: correctPath,
        message: `Path: ${path}`,
        error: null
      });

      // Test 4: File Size Validation
      const smallBuffer = Buffer.alloc(1024 * 1024); // 1MB
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB
      const smallValid = validateFileSize(smallBuffer);
      const largeInvalid = !validateFileSize(largeBuffer);
      results[results.length - 1].tests.push({
        name: 'File Size Validation (1MB)',
        passed: smallValid,
        message: '1MB file accepted',
        error: null
      });
      results[results.length - 1].tests.push({
        name: 'File Size Validation (5MB)',
        passed: largeInvalid,
        message: '5MB file correctly rejected',
        error: null
      });

      // Test 5: File Type Validation
      const pdfValid = validateFileType('application/pdf');
      const textInvalid = !validateFileType('text/plain');
      results[results.length - 1].tests.push({
        name: 'File Type Validation (PDF)',
        passed: pdfValid,
        message: 'PDF type accepted',
        error: null
      });
      results[results.length - 1].tests.push({
        name: 'File Type Validation (Text)',
        passed: textInvalid,
        message: 'Text type correctly rejected',
        error: null
      });
    }

    // ============================================
    // PDF GENERATION TESTS
    // ============================================
    if (testType === 'pdf' || testType === 'all') {
      results.push({ category: 'PDF Generation Tests', tests: [] });

      const testPOAData = {
        principal: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          tenantId: '123e4567-e89b-12d3-a456-426614174001',
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '(555) 123-4567',
          address: {
            street: '123 Test Street',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101'
          }
        },
        poaType: 'durable' as const,
        state: 'FL',
        isDurable: true,
        isSpringing: false,
        isLimited: false,
        agents: [
          {
            type: 'primary' as const,
            fullName: 'Test Agent',
            email: 'agent@example.com',
            address: {
              street: '456 Agent Ave',
              city: 'Miami',
              state: 'FL',
              zipCode: '33102'
            }
          }
        ],
        grantedPowers: {
          categoryIds: ['test-cat'],
          grantAllSubPowers: true
        },
        witnesses: [
          {
            fullName: 'Witness One',
            address: {
              street: '789 Witness Ln',
              city: 'Miami',
              state: 'FL',
              zipCode: '33103'
            }
          },
          {
            fullName: 'Witness Two',
            address: {
              street: '321 Observer St',
              city: 'Miami',
              state: 'FL',
              zipCode: '33104'
            }
          }
        ]
      };

      try {
        // Test 1: Generate Durable POA
        const pdfResult = await generateFinancialPOAPDF({ poaData: testPOAData });
        results[results.length - 1].tests.push({
          name: 'Generate Durable POA PDF',
          passed: pdfResult.buffer.length > 0,
          message: `Generated ${(pdfResult.buffer.length / 1024).toFixed(2)} KB, ${pdfResult.pageCount} pages`,
          error: null,
          details: {
            filename: pdfResult.filename,
            size: pdfResult.buffer.length,
            pageCount: pdfResult.pageCount
          }
        });

        // Test 2: Generate Springing POA
        const springingData = {
          ...testPOAData,
          state: 'TX',
          isSpringing: true,
          springingCondition: 'Incapacity as determined by physician',
          numberOfPhysiciansRequired: 1
        };
        const springingPDF = await generateFinancialPOAPDF({ poaData: springingData });
        results[results.length - 1].tests.push({
          name: 'Generate Springing POA PDF',
          passed: springingPDF.buffer.length > 0 && springingPDF.pageCount > 0,
          message: `Generated ${springingPDF.pageCount} pages`,
          error: null
        });

        // Test 3: Generate Limited POA
        const limitedData = {
          ...testPOAData,
          isLimited: true,
          specificPurpose: 'To sell property at 555 Main St',
          expirationDate: '2024-12-31T23:59:59Z'
        };
        const limitedPDF = await generateFinancialPOAPDF({ poaData: limitedData });
        results[results.length - 1].tests.push({
          name: 'Generate Limited POA PDF',
          passed: limitedPDF.buffer.length > 0,
          message: `Generated ${limitedPDF.pageCount} pages`,
          error: null
        });

        // Test 4: Generate Healthcare POA
        const healthcareData = {
          principal: testPOAData.principal,
          state: 'FL',
          agents: [testPOAData.agents[0]],
          healthcarePowers: {
            medicalTreatment: true,
            mentalHealthTreatment: true,
            endOfLifeDecisions: true,
            organDonation: true,
            autopsyDecision: false,
            dispositionOfRemains: true
          },
          lifeSustainingTreatment: 'agent_decides' as const,
          witnesses: testPOAData.witnesses,
          useStatutoryForm: true
        };
        const healthcarePDF = await generateHealthcarePOAPDF({ poaData: healthcareData });
        results[results.length - 1].tests.push({
          name: 'Generate Healthcare POA PDF',
          passed: healthcarePDF.buffer.length > 0,
          message: `Generated ${healthcarePDF.pageCount} pages`,
          error: null
        });

      } catch (error) {
        results[results.length - 1].tests.push({
          name: 'PDF Generation',
          passed: false,
          message: 'PDF generation failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Calculate summary
    const totalTests = results.reduce((sum, cat) => sum + cat.tests.length, 0);
    const passedTests = results.reduce(
      (sum, cat) => sum + cat.tests.filter((t: any) => t.passed).length,
      0
    );

    return NextResponse.json({
      success: true,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        passRate: ((passedTests / totalTests) * 100).toFixed(1) + '%'
      },
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test execution error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Phase 2 Testing API',
    endpoints: {
      POST: {
        description: 'Run Phase 2 tests',
        body: {
          testType: '"validation" | "storage" | "pdf" | "all"'
        }
      }
    }
  });
}
