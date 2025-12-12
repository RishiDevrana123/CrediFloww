/**
 * OCR SERVICE using Tesseract.js (FREE)
 * 
 * Provides document scanning and text extraction
 */

import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

/**
 * Extract text from image using Tesseract OCR
 */
async function extractTextFromImage(imagePath) {
  try {
    console.log(`📄 Scanning document: ${path.basename(imagePath)}`);
    
    const { data: { text, confidence } } = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`   Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log(`✅ OCR Complete - Confidence: ${Math.round(confidence)}%`);
    return { text, confidence };
  } catch (error) {
    console.error('❌ OCR Error:', error.message);
    throw error;
  }
}

/**
 * Identify document type by scanning content
 */
export async function identifyDocumentType(imagePath) {
  try {
    console.log(`\n🔍 Identifying document type...`);
    
    // First try filename detection (fast)
    const filename = path.basename(imagePath).toLowerCase();
    
    if (filename.includes('pan')) {
      console.log('✅ Detected from filename: PAN Card');
      return 'pan';
    }
    if (filename.includes('aadhar') || filename.includes('aadhaar')) {
      console.log('✅ Detected from filename: Aadhar Card');
      return 'aadhar';
    }
    if (filename.includes('salary') || filename.includes('payslip')) {
      console.log('✅ Detected from filename: Salary Slip');
      return 'salary-slip';
    }
    
    // If filename doesn't help, scan the document
    console.log('🔎 Filename unclear, scanning document content...');
    const { text } = await extractTextFromImage(imagePath);
    const textLower = text.toLowerCase();
    
    // Check for PAN card indicators
    if (textLower.includes('income tax') || 
        textLower.includes('permanent account number') ||
        /[A-Z]{5}[0-9]{4}[A-Z]/.test(text)) {
      console.log('✅ Detected from content: PAN Card');
      return 'pan';
    }
    
    // Check for Aadhar card indicators
    if (textLower.includes('aadhaar') || 
        textLower.includes('aadhar') ||
        textLower.includes('government of india') ||
        /\d{4}\s?\d{4}\s?\d{4}/.test(text)) {
      console.log('✅ Detected from content: Aadhar Card');
      return 'aadhar';
    }
    
    // Check for salary slip indicators
    if (textLower.includes('salary') || 
        textLower.includes('payslip') ||
        textLower.includes('pay slip') ||
        textLower.includes('earnings') ||
        textLower.includes('deductions') ||
        textLower.includes('gross pay') ||
        textLower.includes('net pay')) {
      console.log('✅ Detected from content: Salary Slip');
      return 'salary-slip';
    }
    
    console.log('⚠️  Could not identify document type');
    return 'other';
    
  } catch (error) {
    console.error('❌ Document Type Identification Error:', error.message);
    
    // Fallback to filename
    const filename = path.basename(imagePath).toLowerCase();
    if (filename.includes('pan')) return 'pan';
    if (filename.includes('aadhar')) return 'aadhar';
    if (filename.includes('salary')) return 'salary-slip';
    
    return 'other';
  }
}

/**
 * Extract structured data from PAN card
 */
async function extractPANData(text) {
  const data = {
    panNumber: 'UNCLEAR',
    name: 'UNCLEAR',
    fatherName: 'UNCLEAR',
    dateOfBirth: 'UNCLEAR'
  };
  
  // Extract PAN number (format: ABCDE1234F)
  const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
  if (panMatch) {
    data.panNumber = panMatch[0];
  }
  
  // Extract name (usually appears after "Name" or before "Father's Name")
  const nameMatch = text.match(/Name[:\s]*([A-Z\s]+)/i);
  if (nameMatch) {
    data.name = nameMatch[1].trim();
  }
  
  // Extract father's name
  const fatherMatch = text.match(/Father'?s?\s*Name[:\s]*([A-Z\s]+)/i);
  if (fatherMatch) {
    data.fatherName = fatherMatch[1].trim();
  }
  
  // Extract date of birth (DD/MM/YYYY or similar)
  const dobMatch = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
  if (dobMatch) {
    data.dateOfBirth = dobMatch[1];
  }
  
  return data;
}

/**
 * Extract structured data from Aadhar card
 */
async function extractAadharData(text) {
  const data = {
    aadharNumber: 'UNCLEAR',
    name: 'UNCLEAR',
    address: 'UNCLEAR',
    dateOfBirth: 'UNCLEAR'
  };
  
  // Extract Aadhar number (12 digits)
  const aadharMatch = text.match(/(\d{4}\s?\d{4}\s?\d{4})/);
  if (aadharMatch) {
    data.aadharNumber = aadharMatch[1].replace(/\s/g, '');
  }
  
  // Extract name (usually first prominent text)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  for (const line of lines) {
    if (/^[A-Z\s]{5,}$/i.test(line.trim()) && line.trim().length < 50) {
      data.name = line.trim();
      break;
    }
  }
  
  // Extract DOB
  const dobMatch = text.match(/DOB[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i) || 
                   text.match(/Birth[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
  if (dobMatch) {
    data.dateOfBirth = dobMatch[1];
  }
  
  // Extract address (lines after name, before DOB)
  const addressLines = [];
  let foundName = false;
  for (const line of lines) {
    if (line.includes(data.name)) {
      foundName = true;
      continue;
    }
    if (foundName && !line.match(/\d{4}\s?\d{4}\s?\d{4}/) && !line.match(/DOB|Birth/i)) {
      addressLines.push(line.trim());
      if (addressLines.length >= 3) break;
    }
  }
  if (addressLines.length > 0) {
    data.address = addressLines.join(', ');
  }
  
  return data;
}

/**
 * Extract structured data from salary slip
 */
async function extractSalarySlipData(text) {
  const data = {
    employeeName: 'UNCLEAR',
    companyName: 'UNCLEAR',
    month: 'UNCLEAR',
    year: 'UNCLEAR',
    grossSalary: 0,
    netSalary: 0,
    accountNumber: 'UNCLEAR'
  };
  
  // Extract employee name
  const nameMatch = text.match(/Employee\s*Name[:\s]*([A-Z\s]+)/i);
  if (nameMatch) {
    data.employeeName = nameMatch[1].trim();
  }
  
  // Extract company name (usually at top)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    data.companyName = lines[0].trim();
  }
  
  // Extract month and year
  const monthYearMatch = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{4})/i);
  if (monthYearMatch) {
    data.month = monthYearMatch[1];
    data.year = monthYearMatch[2];
  }
  
  // Extract gross salary
  const grossMatch = text.match(/Gross\s*Salary[:\s]*[₹Rs\.]*\s*([\d,]+)/i);
  if (grossMatch) {
    data.grossSalary = parseInt(grossMatch[1].replace(/,/g, ''));
  }
  
  // Extract net salary
  const netMatch = text.match(/Net\s*Salary[:\s]*[₹Rs\.]*\s*([\d,]+)/i) ||
                   text.match(/Take[- ]?Home[:\s]*[₹Rs\.]*\s*([\d,]+)/i);
  if (netMatch) {
    data.netSalary = parseInt(netMatch[1].replace(/,/g, ''));
  }
  
  // Extract account number
  const accMatch = text.match(/Account\s*Number[:\s]*(\d+)/i) ||
                   text.match(/A\/C[:\s]*(\d+)/i);
  if (accMatch) {
    data.accountNumber = accMatch[1];
  }
  
  return data;
}

/**
 * Extract document data based on type
 */
export async function extractDocumentData(imagePath, documentType) {
  try {
    console.log(`\n📋 Extracting data from ${documentType}...`);
    
    const { text, confidence } = await extractTextFromImage(imagePath);
    
    if (confidence < 30) {
      console.log('⚠️  Low confidence OCR - document may be blurry');
    }
    
    let extractedData = {};
    
    if (documentType === 'PAN') {
      extractedData = await extractPANData(text);
    } else if (documentType === 'AADHAR') {
      extractedData = await extractAadharData(text);
    } else if (documentType === 'SALARY_SLIP') {
      extractedData = await extractSalarySlipData(text);
    } else {
      extractedData = { rawText: text };
    }
    
    console.log('✅ Data extracted:', extractedData);
    return extractedData;
    
  } catch (error) {
    console.error('❌ Extract Document Data Error:', error.message);
    return { error: error.message };
  }
}

/**
 * Verify document quality (check if image is readable)
 */
export async function verifyDocumentQuality(imagePath) {
  try {
    console.log(`\n🔍 Verifying document quality...`);
    
    const { text, confidence } = await extractTextFromImage(imagePath);
    
    const result = {
      isValid: confidence > 30,
      confidence: Math.round(confidence),
      isBlurry: confidence < 50,
      isTampered: false, // Basic OCR can't detect tampering
      message: ''
    };
    
    if (confidence >= 70) {
      result.message = 'Document is clear and readable';
    } else if (confidence >= 50) {
      result.message = 'Document quality is acceptable';
    } else if (confidence >= 30) {
      result.message = 'Document quality is poor but readable';
    } else {
      result.message = 'Document is too blurry or unreadable';
    }
    
    console.log(`✅ Quality check: ${result.message} (${result.confidence}%)`);
    return result;
    
  } catch (error) {
    console.error('❌ Verify Document Quality Error:', error.message);
    return {
      isValid: false,
      confidence: 0,
      isBlurry: true,
      isTampered: false,
      message: 'Could not verify document quality'
    };
  }
}

/**
 * Calculate credit score based on salary slip data
 */
export async function calculateCreditScore(salaryData) {
  try {
    let score = 650; // Base score
    
    // Adjust based on net salary
    if (salaryData.netSalary > 50000) score += 100;
    else if (salaryData.netSalary > 30000) score += 50;
    else if (salaryData.netSalary > 20000) score += 25;
    
    // Adjust based on company stability (if recognized)
    if (salaryData.companyName && salaryData.companyName.length > 0) {
      score += 20;
    }
    
    // Cap at 850
    score = Math.min(score, 850);
    
    return {
      estimatedScore: score,
      factors: {
        salary: salaryData.netSalary,
        company: salaryData.companyName
      }
    };
    
  } catch (error) {
    console.error('❌ Calculate Credit Score Error:', error.message);
    return {
      estimatedScore: 650,
      factors: {}
    };
  }
}
