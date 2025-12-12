/**
 * SANCTION LETTER AGENT
 * 
 * Purpose: Generate professional PDF sanction letter for approved loans
 * Uses: PDFKit for PDF generation
 * 
 * Returns: Generated PDF stream
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure sanction letters directory exists
const SANCTION_DIR = path.join(__dirname, '../sanction-letters');
if (!fs.existsSync(SANCTION_DIR)) {
  fs.mkdirSync(SANCTION_DIR, { recursive: true });
}

/**
 * Generate sanction letter PDF
 * @param {Object} sanctionData - Loan approval data
 * @param {Object} res - Express response object (for streaming)
 * @returns {string} File path of generated PDF
 */
export const generateSanctionLetter = async (sanctionData, res = null) => {
  console.log('📄 Sanction Letter Agent: Generating PDF', { sanctionId: sanctionData.sanctionId });
  
  try {
    const {
      sanctionId,
      fullName,
      mobile,
      loanAmount,
      tenureMonths,
      emi,
      interestRate,
      creditScore,
      approvedAt
    } = sanctionData;
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // If response object provided, stream to response
    if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Sanction-Letter-${sanctionId}.pdf`
      );
      doc.pipe(res);
    }
    
    // Also save to file
    const filePath = path.join(SANCTION_DIR, `${sanctionId}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    
    // TATA branding colors
    const tataBlue = '#0033A0';
    const tataGold = '#D4A574';
    const darkGray = '#333333';
    
    // ============= HEADER =============
    doc
      .fillColor(tataBlue)
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('CrediFlow', 50, 50);
    
    doc
      .fontSize(10)
      .fillColor('#666666')
      .font('Helvetica')
      .text('A TATA Enterprise', 50, 82);
    
    // Header line
    doc
      .moveTo(50, 110)
      .lineTo(550, 110)
      .strokeColor(tataGold)
      .lineWidth(2)
      .stroke();
    
    // ============= DOCUMENT TITLE =============
    doc
      .moveDown(2)
      .fillColor(tataBlue)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('LOAN SANCTION LETTER', 50, 140, { align: 'center' });
    
    // Date and Sanction ID
    doc
      .moveDown(2)
      .fillColor(darkGray)
      .fontSize(10)
      .font('Helvetica')
      .text(`Date: ${formatDate(approvedAt || new Date())}`, 400, 180);
    
    doc
      .text(`Sanction ID: ${sanctionId}`, 400, 195);
    
    // ============= RECIPIENT ADDRESS =============
    doc
      .moveDown(3)
      .fontSize(11)
      .text(`Dear ${fullName},`, 50, 230);
    
    // ============= BODY TEXT =============
    doc
      .moveDown(1.5)
      .fontSize(11)
      .text(
        'We are pleased to inform you that your loan application has been approved by CrediFlow, a TATA Enterprise. ' +
        'Your application has been carefully reviewed and we are delighted to sanction your loan request.',
        50,
        doc.y,
        { align: 'justify', lineGap: 3 }
      );
    
    doc
      .moveDown()
      .text(
        'The loan sanction is subject to the terms and conditions mentioned below and final documentation.',
        50,
        doc.y,
        { align: 'justify', lineGap: 3 }
      );
    
    // ============= LOAN DETAILS BOX =============
    const boxStartY = doc.y + 20;
    
    // Draw box background
    doc
      .rect(50, boxStartY, 500, 200)
      .fillAndStroke('#F8F9FA', tataBlue)
      .lineWidth(1.5);
    
    // Box title
    doc
      .fillColor(tataBlue)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('LOAN SANCTION DETAILS', 70, boxStartY + 15);
    
    // Draw separator line
    doc
      .moveTo(70, boxStartY + 35)
      .lineTo(530, boxStartY + 35)
      .strokeColor(tataGold)
      .lineWidth(1)
      .stroke();
    
    // Details
    const detailsX = 80;
    let currentY = boxStartY + 50;
    const lineHeight = 25;
    
    const addDetail = (label, value) => {
      doc
        .fillColor('#555555')
        .fontSize(10)
        .font('Helvetica')
        .text(label, detailsX, currentY);
      
      doc
        .fillColor(tataBlue)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(value, detailsX + 200, currentY);
      
      currentY += lineHeight;
    };
    
    addDetail('Applicant Name:', fullName);
    addDetail('Mobile Number:', mobile);
    addDetail('Sanctioned Loan Amount:', `₹${loanAmount.toLocaleString('en-IN')}`);
    addDetail('Interest Rate:', `${interestRate}% per annum`);
    addDetail('Loan Tenure:', `${tenureMonths} months`);
    addDetail('Monthly EMI:', `₹${Math.round(emi).toLocaleString('en-IN')}`);
    addDetail('Credit Score:', creditScore);
    
    doc.font('Helvetica'); // Reset font
    
    // ============= TERMS & CONDITIONS =============
    currentY = boxStartY + 220;
    
    doc
      .fillColor(tataBlue)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Terms & Conditions:', 50, currentY);
    
    currentY += 25;
    
    const terms = [
      'This sanction letter is valid for 15 days from the date of issue.',
      'The loan amount will be disbursed after completion of all documentation and verification.',
      'Processing fee and other applicable charges will be communicated separately.',
      'The loan is subject to final verification of submitted documents.',
      'Interest will be charged as per the prevailing rate at the time of disbursement.',
      'Prepayment charges may apply as per loan agreement terms.',
      'Please review and sign the loan agreement within 15 days to proceed.'
    ];
    
    doc
      .fillColor(darkGray)
      .fontSize(9)
      .font('Helvetica');
    
    terms.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`, 60, currentY, {
        width: 480,
        lineGap: 2
      });
      currentY = doc.y + 8;
    });
    
    // ============= CONTACT INFORMATION =============
    currentY = doc.y + 25;
    
    doc
      .fillColor(tataBlue)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('For any queries, please contact us:', 50, currentY);
    
    currentY += 20;
    
    doc
      .fillColor(darkGray)
      .fontSize(9)
      .font('Helvetica')
      .text('📞 Phone: 1800-209-8800 (Toll-Free)', 50, currentY)
      .text('📧 Email: [email protected]', 50, currentY + 15)
      .text('🌐 Website: www.crediflow.com', 50, currentY + 30);
    
    // ============= SIGNATURE SECTION =============
    currentY = doc.y + 50;
    
    doc
      .fontSize(10)
      .fillColor(darkGray)
      .text('Yours sincerely,', 50, currentY);
    
    doc
      .moveDown(1.5)
      .fillColor(tataBlue)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('CrediFlow Approval Team', 50);
    
    doc
      .fontSize(9)
      .fillColor('#666666')
      .font('Helvetica')
      .text('A TATA Enterprise', 50);
    
    // ============= FOOTER =============
    const footerY = 750;
    
    // Footer line
    doc
      .moveTo(50, footerY)
      .lineTo(550, footerY)
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
        footerY + 10,
        { align: 'center', width: 500 }
      );
    
    doc
      .fontSize(7)
      .text(
        'This is a system-generated document and does not require a physical signature.',
        50,
        footerY + 25,
        { align: 'center', width: 500 }
      );
    
    // Finalize PDF
    doc.end();
    
    // Wait for file to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    console.log('✅ Sanction Letter Agent: PDF generated successfully', filePath);
    
    return filePath;
    
  } catch (error) {
    console.error('❌ Sanction Letter Agent: Error generating PDF', error);
    throw error;
  }
};

/**
 * Format date in Indian format
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Get sanction letter file path
 */
export const getSanctionLetterPath = (sanctionId) => {
  return path.join(SANCTION_DIR, `${sanctionId}.pdf`);
};

/**
 * Check if sanction letter exists
 */
export const sanctionLetterExists = (sanctionId) => {
  const filePath = getSanctionLetterPath(sanctionId);
  return fs.existsSync(filePath);
};

export default {
  generateSanctionLetter,
  getSanctionLetterPath,
  sanctionLetterExists
};
