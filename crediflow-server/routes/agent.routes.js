/**
 * AGENT ROUTES
 * 
 * Multi-agent loan approval system endpoints
 */

import express from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { extractDocumentData } from '../agents/documentExtractor.js';
import { verifyKYC } from '../agents/kycAgent.js';
import { verifySalarySlip } from '../agents/salarySlipAgent.js';
import { makeUnderwritingDecision, getSanctionData } from '../agents/underwritingAgent.js';
import { generateSanctionLetter, getSanctionLetterPath, sanctionLetterExists } from '../agents/sanctionAgent.js';
import fs from 'fs';

const router = express.Router();

/**
 * POST /api/document/extract
 * Extract data from uploaded document (salary slip or KYC)
 */
router.post('/document/extract', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No document uploaded'
      });
    }

    console.log('📤 Document extraction request:', req.file.originalname);

    // Extract data using Document Extraction Agent
    const result = await extractDocumentData(req.file.buffer, req.file.mimetype);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error,
        details: result.details
      });
    }

    res.json({
      status: 'success',
      data: result.data,
      meta: {
        confidence: result.confidence,
        processingTime: result.processingTime
      }
    });

  } catch (error) {
    console.error('Error in document extraction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to extract document data',
      error: error.message
    });
  }
});

/**
 * POST /api/loan/eligibility
 * Check loan eligibility with multi-agent flow
 * Input: { fullName, mobile, email, loanAmount, tenureMonths, city, loanPurpose }
 * Output: APPROVED | PENDING | REJECTED
 */
router.post('/loan/eligibility', async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      email,
      loanAmount,
      tenureMonths,
      city,
      loanPurpose
    } = req.body;

    // Validate required fields
    if (!fullName || !mobile || !loanAmount || !tenureMonths) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: fullName, mobile, loanAmount, tenureMonths'
      });
    }

    console.log('🔍 Eligibility check request:', { fullName, mobile, loanAmount });

    // Step 1: KYC Verification (without document, just CRM check)
    const kycResult = await verifyKYC({ name: fullName, pan: null }, mobile);

    // Step 2: Underwriting Decision
    const underwritingResult = await makeUnderwritingDecision({
      loanAmount: parseFloat(loanAmount),
      tenureMonths: parseInt(tenureMonths),
      kycResult,
      salaryResult: null, // No salary slip at this stage
      mobile,
      fullName
    });

    // Step 3: Generate sanction letter if approved
    if (underwritingResult.decision === 'APPROVED' && underwritingResult.sanctionUrl) {
      const sanctionId = underwritingResult.sanctionUrl.split('/').pop();
      const sanctionData = getSanctionData(sanctionId);
      
      if (sanctionData) {
        // Generate PDF (don't wait for completion)
        generateSanctionLetter({ ...sanctionData, sanctionId }).catch(err => {
          console.error('Error generating sanction letter:', err);
        });
      }
    }

    // Map decision to output format
    const response = {
      status: 'success',
      decision: underwritingResult.decision,
      creditScore: underwritingResult.creditScore,
      preApprovedLimit: underwritingResult.preApprovedLimit,
      reasons: underwritingResult.reasons,
      sanctionUrl: underwritingResult.sanctionUrl,
      details: {
        requiresSalarySlip: underwritingResult.requiresSalarySlip,
        emi: underwritingResult.emi,
        interestRate: underwritingResult.interestRate,
        maxAllowedEmi: underwritingResult.maxAllowedEmi
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error in eligibility check:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check eligibility',
      error: error.message
    });
  }
});

/**
 * POST /api/loan/salary-verification
 * Verify salary and recalculate loan approval
 * Input: { loanAmount, tenureMonths, monthlySalary, mobile, fullName }
 * Output: APPROVED | REJECTED
 */
router.post('/loan/salary-verification', async (req, res) => {
  try {
    const {
      loanAmount,
      tenureMonths,
      monthlySalary,
      mobile,
      fullName,
      employer
    } = req.body;

    // Validate required fields
    if (!loanAmount || !tenureMonths || !monthlySalary || !mobile) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: loanAmount, tenureMonths, monthlySalary, mobile'
      });
    }

    console.log('💰 Salary verification request:', { monthlySalary, loanAmount });

    // Step 1: Verify salary slip
    const salaryResult = await verifySalarySlip(
      { monthlySalary: parseFloat(monthlySalary), employer },
      parseFloat(loanAmount)
    );

    // Step 2: KYC check
    const kycResult = await verifyKYC({ name: fullName, pan: null }, mobile);

    // Step 3: Underwriting decision with salary data
    const underwritingResult = await makeUnderwritingDecision({
      loanAmount: parseFloat(loanAmount),
      tenureMonths: parseInt(tenureMonths),
      kycResult,
      salaryResult,
      mobile,
      fullName
    });

    // Step 4: Generate sanction letter if approved
    if (underwritingResult.decision === 'APPROVED' && underwritingResult.sanctionUrl) {
      const sanctionId = underwritingResult.sanctionUrl.split('/').pop();
      const sanctionData = getSanctionData(sanctionId);
      
      if (sanctionData) {
        await generateSanctionLetter({ ...sanctionData, sanctionId });
      }
    }

    const response = {
      status: 'success',
      decision: underwritingResult.decision,
      emi: underwritingResult.emi,
      maxAllowedEmi: underwritingResult.maxAllowedEmi,
      reasons: underwritingResult.reasons,
      sanctionUrl: underwritingResult.sanctionUrl,
      details: {
        salaryVerification: salaryResult.status,
        riskLevel: salaryResult.riskLevel,
        maxEligibleLoan: salaryResult.details.maxEligibleLoan,
        interestRate: underwritingResult.interestRate
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error in salary verification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify salary',
      error: error.message
    });
  }
});

/**
 * GET /api/agent-trace
 * Get the multi-agent workflow trace
 */
router.get('/agent-trace', (req, res) => {
  const trace = [
    {
      agent: 'Sales Agent',
      step: 1,
      description: 'Collects customer information and loan requirements',
      actions: ['Gather personal details', 'Capture loan amount and tenure', 'Initial eligibility screening'],
      status: 'active'
    },
    {
      agent: 'Verification Agent',
      step: 2,
      description: 'Verifies customer identity and documents',
      actions: ['KYC verification against CRM', 'Document extraction and validation', 'PAN and address verification'],
      subAgents: ['Document Extraction Agent', 'KYC Agent', 'Salary Slip Agent'],
      status: 'active'
    },
    {
      agent: 'Underwriting Agent',
      step: 3,
      description: 'Makes final loan approval decision',
      actions: [
        'Credit score evaluation',
        'Calculate pre-approved limit',
        'Debt-to-income ratio analysis',
        'Risk assessment',
        'Final approval/rejection decision'
      ],
      criteria: {
        minCreditScore: 700,
        maxDTI: '50%',
        maxLoanToIncome: '60% of annual salary'
      },
      status: 'active'
    },
    {
      agent: 'Sanction Agent',
      step: 4,
      description: 'Generates official sanction letter',
      actions: [
        'Create PDF sanction letter',
        'Include loan terms and conditions',
        'Generate unique sanction ID',
        'Store and provide download URL'
      ],
      status: 'active'
    }
  ];

  res.json({
    status: 'success',
    workflow: 'Multi-Agent Loan Approval System',
    totalSteps: trace.length,
    agents: trace
  });
});

/**
 * GET /api/sanction-letter/:id
 * Download sanction letter PDF
 */
router.get('/sanction-letter/:id', async (req, res) => {
  try {
    const sanctionId = req.params.id;
    
    console.log('📄 Sanction letter download request:', sanctionId);

    // Check if sanction data exists
    const sanctionData = getSanctionData(sanctionId);
    if (!sanctionData) {
      return res.status(404).json({
        status: 'error',
        message: 'Sanction letter not found'
      });
    }

    // Check if PDF already exists
    const pdfPath = getSanctionLetterPath(sanctionId);
    
    if (!sanctionLetterExists(sanctionId)) {
      // Generate PDF if it doesn't exist
      console.log('Generating sanction letter PDF...');
      await generateSanctionLetter({ ...sanctionData, sanctionId }, res);
      return; // generateSanctionLetter will handle the response
    }

    // Stream existing PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Sanction-Letter-${sanctionId}.pdf`
    );

    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading sanction letter:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download sanction letter',
      error: error.message
    });
  }
});

export default router;
