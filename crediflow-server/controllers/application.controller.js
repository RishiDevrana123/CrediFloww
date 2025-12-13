import Application from '../models/Application.model.js';
import PDFDocument from 'pdfkit';

// Create new application with mock approval flow
export const createApplication = async (req, res) => {
  try {
    console.log('📝 Creating application with data:', req.body);
    
    // Create application
    const application = await Application.create(req.body);
    console.log('✅ Application created successfully:', application.applicationId);
    
    // Mock automatic approval after 3 seconds (simulating processing)
    setTimeout(async () => {
      try {
        // Mock approval logic
        const mockInterestRate = 10.99; // Fixed interest rate
        const mockCreditScore = 750; // Mock credit score
        const approvedAmount = application.loanAmount; // Approve requested amount
        
        // Calculate EMI
        const principal = approvedAmount;
        const rate = mockInterestRate / 12 / 100;
        const tenure = application.tenure;
        const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
        
        // Update application with approval
        application.status = 'approved';
        application.stage = 'completed';
        application.approvedAmount = approvedAmount;
        application.approvedTenure = tenure;
        application.interestRate = mockInterestRate;
        application.creditScore = mockCreditScore;
        application.emi = Math.round(emi);
        
        await application.save();
        console.log('✅ Application auto-approved:', application.applicationId);
      } catch (error) {
        console.error('❌ Error auto-approving:', error.message);
      }
    }, 3000);
    
    res.status(201).json({
      status: 'success',
      data: application,
    });
  } catch (error) {
    console.error('❌ Error creating application:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get single application
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }
    res.json({
      status: 'success',
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const { status, stage, loanType, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (stage) filter.stage = stage;
    if (loanType) filter.loanType = loanType;

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(filter);

    res.json({
      status: 'success',
      data: applications,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Update application
export const updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }
    res.json({
      status: 'success',
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Delete application
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }
    res.json({
      status: 'success',
      message: 'Application deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Upload document with mock KYC verification
export const uploadDocument = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }

    const filename = req.file.filename.toLowerCase();
    const originalname = req.file.originalname.toLowerCase();
    
    // Mock KYC verification based on filename
    let docType = req.body.type || 'other';
    let verificationStatus = 'pending';
    
    // Check filename for document type
    if (filename.includes('pan') || originalname.includes('pan')) {
      docType = 'pan';
      // Mock PAN verification - check if filename contains valid PAN pattern
      if (/[a-z]{5}[0-9]{4}[a-z]/i.test(filename) || /[a-z]{5}[0-9]{4}[a-z]/i.test(originalname)) {
        verificationStatus = 'verified';
      }
    } else if (filename.includes('aadhar') || filename.includes('aadhaar') || originalname.includes('aadhar')) {
      docType = 'aadhar';
      // Mock Aadhar verification - check if filename contains 12 digits
      if (/\d{12}/.test(filename) || /\d{12}/.test(originalname)) {
        verificationStatus = 'verified';
      }
    } else if (filename.includes('salary') || originalname.includes('salary') || filename.includes('slip')) {
      docType = 'salary-slip';
      verificationStatus = 'verified'; // Auto-verify salary slips
    } else if (filename.includes('bank') || originalname.includes('bank') || filename.includes('statement')) {
      docType = 'bank-statement';
      verificationStatus = 'verified'; // Auto-verify bank statements
    }

    const document = {
      type: docType,
      filename: req.file.filename,
      path: req.file.path,
      verificationStatus,
    };

    application.documents.push(document);
    
    // If both PAN and Aadhar are verified, move to next stage
    const panDoc = application.documents.find(d => d.type === 'pan');
    const aadharDoc = application.documents.find(d => d.type === 'aadhar');
    
    if (panDoc && aadharDoc && panDoc.verificationStatus === 'verified' && aadharDoc.verificationStatus === 'verified') {
      application.stage = 'verification';
      application.status = 'under-review';
    }
    
    await application.save();

    res.json({
      status: 'success',
      message: `Document uploaded successfully. Verification status: ${verificationStatus}`,
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Update stage
export const updateStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }

    application.stage = stage;

    // Update stage completion timestamps
    if (stage === 'verification') application.salesCompletedAt = new Date();
    if (stage === 'underwriting') application.verificationCompletedAt = new Date();
    if (stage === 'sanction') application.underwritingCompletedAt = new Date();
    if (stage === 'completed') application.sanctionCompletedAt = new Date();

    await application.save();

    res.json({
      status: 'success',
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Approve application
export const approveApplication = async (req, res) => {
  try {
    const { approvedAmount, interestRate, approvedTenure } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }

    application.status = 'approved';
    application.approvedAmount = approvedAmount || application.loanAmount;
    application.interestRate = interestRate || 10.99;
    application.approvedTenure = approvedTenure || application.tenure;
    application.emi = application.calculateEMI();

    await application.save();

    res.json({
      status: 'success',
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Reject application
export const rejectApplication = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }

    application.status = 'rejected';
    application.rejectionReason = rejectionReason;

    await application.save();

    res.json({
      status: 'success',
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Generate Sanction Letter PDF
export const generateSanctionLetter = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }

    if (application.status !== 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Application is not approved yet',
      });
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Sanction-Letter-${application.applicationId}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add TATA branding colors
    const tataBlue = '#0033A0';
    const tataGold = '#D4A574';

    // Header with TATA branding
    doc
      .fillColor(tataBlue)
      .fontSize(24)
      .text('CrediFlow', 50, 50)
      .fontSize(10)
      .fillColor('#666666')
      .text('A TATA Enterprise', 50, 80);

    // Draw line separator
    doc
      .moveTo(50, 110)
      .lineTo(550, 110)
      .strokeColor(tataGold)
      .lineWidth(2)
      .stroke();

    // Document title
    doc
      .moveDown(2)
      .fillColor(tataBlue)
      .fontSize(20)
      .text('LOAN SANCTION LETTER', { align: 'center' })
      .moveDown();

    // Letter date
    doc
      .fillColor('#333333')
      .fontSize(11)
      .text(`Date: ${new Date().toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })}`, { align: 'right' })
      .moveDown();

    // Application details
    doc
      .fontSize(11)
      .text(`Application ID: ${application.applicationId}`, { align: 'right' })
      .moveDown(2);

    // Greeting
    doc
      .text(`Dear ${application.fullName},`, 50)
      .moveDown();

    // Body text
    doc
      .fontSize(11)
      .fillColor('#333333')
      .text(
        'We are pleased to inform you that your loan application has been approved by CrediFlow.',
        50,
        doc.y,
        { align: 'justify' }
      )
      .moveDown()
      .text(
        'Below are the details of your approved loan:',
        50,
        doc.y,
        { align: 'justify' }
      )
      .moveDown(2);

    // Loan details box
    const detailsStartY = doc.y;
    doc
      .rect(50, detailsStartY, 500, 180)
      .fillAndStroke('#F5F5F5', tataBlue);

    doc
      .fillColor(tataBlue)
      .fontSize(12)
      .text('LOAN DETAILS', 70, detailsStartY + 15, { underline: true })
      .moveDown();

    const detailsX = 70;
    let currentY = doc.y;

    // Helper function for details
    const addDetail = (label, value) => {
      doc
        .fillColor('#333333')
        .fontSize(11)
        .text(`${label}:`, detailsX, currentY)
        .fillColor(tataBlue)
        .font('Helvetica-Bold')
        .text(value, detailsX + 150, currentY)
        .font('Helvetica');
      currentY += 20;
    };

    addDetail('Loan Type', application.loanType.charAt(0).toUpperCase() + application.loanType.slice(1));
    addDetail('Loan Amount', `₹${application.loanAmount.toLocaleString('en-IN')}`);
    addDetail('Interest Rate', `${application.interestRate}% per annum`);
    addDetail('Tenure', `${application.tenure} months`);
    addDetail('EMI Amount', `₹${Math.round(application.emi || 0).toLocaleString('en-IN')}`);

    doc.moveDown(3);

    // Terms and conditions
    doc
      .fillColor('#333333')
      .fontSize(10)
      .text('Terms & Conditions:', 50)
      .moveDown(0.5)
      .fontSize(9)
      .text('1. This sanction is subject to verification of all submitted documents.', 60)
      .text('2. The loan amount will be disbursed after completion of all formalities.', 60)
      .text('3. Please review and sign the loan agreement within 15 days.', 60)
      .text('4. Processing fee and other charges apply as per the loan agreement.', 60)
      .moveDown(2);

    // Footer
    doc
      .fillColor(tataBlue)
      .fontSize(10)
      .text('For any queries, please contact us:', 50)
      .fontSize(9)
      .fillColor('#333333')
      .text('Phone: 1800-209-8800', 50)
      .text('Email: [email protected]', 50)
      .moveDown(2);

    // Signature section
    doc
      .fontSize(10)
      .text('Yours sincerely,', 50)
      .moveDown()
      .fillColor(tataBlue)
      .fontSize(11)
      .text('CrediFlow Approval Team', 50)
      .fontSize(9)
      .fillColor('#666666')
      .text('A TATA Enterprise', 50);

    // Footer line
    doc
      .moveTo(50, 750)
      .lineTo(550, 750)
      .strokeColor(tataGold)
      .lineWidth(1)
      .stroke();

    // Footer text
    doc
      .fontSize(8)
      .fillColor('#999999')
      .text(
        '© 2025 CrediFlow - A TATA Enterprise. All rights reserved.',
        50,
        760,
        { align: 'center' }
      );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating sanction letter:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
