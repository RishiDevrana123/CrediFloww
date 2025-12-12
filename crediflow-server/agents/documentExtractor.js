/**
 * DOCUMENT EXTRACTION AGENT
 * 
 * Purpose: Extract structured data from uploaded documents (salary slips, KYC documents)
 * Uses: Vision API (GPT-4o) or mock extraction for demo
 * 
 * Returns: { name, employer, monthlySalary, pan, address, documentType }
 */

import axios from 'axios';

// Mock data for demo purposes - replace with actual Vision API
const MOCK_EXTRACTED_DATA = {
  salary_slip: {
    name: 'Abheek Sehgal',
    employer: 'Tech Corp India',
    monthlySalary: 45000,
    pan: 'ABCDE1234F',
    address: 'Delhi',
    documentType: 'SALARY_SLIP'
  },
  kyc_document: {
    name: 'Abheek Sehgal',
    employer: null,
    monthlySalary: null,
    pan: 'ABCDE1234F',
    address: 'Delhi',
    documentType: 'KYC_DOCUMENT'
  }
};

/**
 * Extract data from document using Vision API
 * @param {Buffer} fileBuffer - The uploaded file buffer
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<Object>} Extracted fields
 */
export const extractDocumentData = async (fileBuffer, mimeType) => {
  try {
    // TODO: Implement actual Vision API call (GPT-4o)
    // For demo, we'll use mock extraction based on file content analysis
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock decision: Check if this looks like a salary slip or KYC doc
    // In production, this would be determined by Vision API
    const isSalarySlip = detectDocumentType(fileBuffer);
    
    const extractedData = isSalarySlip 
      ? MOCK_EXTRACTED_DATA.salary_slip 
      : MOCK_EXTRACTED_DATA.kyc_document;
    
    console.log('📄 Document Extraction Agent: Extracted data', extractedData);
    
    return {
      success: true,
      data: extractedData,
      confidence: 0.95,
      processingTime: '1.2s'
    };
    
  } catch (error) {
    console.error('❌ Document Extraction Agent: Error', error);
    return {
      success: false,
      error: 'Failed to extract document data',
      details: error.message
    };
  }
};

/**
 * Call GPT-4o Vision API for actual extraction
 * @param {Buffer} fileBuffer 
 * @param {string} mimeType 
 */
const callVisionAPI = async (fileBuffer, mimeType) => {
  // TODO: Implement actual Vision API integration
  // Example structure:
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  
  const base64Image = fileBuffer.toString('base64');
  
  const prompt = `
    Analyze this document and extract the following information in JSON format:
    - name: Full name of the person
    - employer: Company/employer name (if present)
    - monthlySalary: Monthly salary amount in INR (if present)
    - pan: PAN card number (if present)
    - address: Address (if present)
    - documentType: Type of document (SALARY_SLIP, PAN_CARD, AADHAR_CARD, BANK_STATEMENT)
    
    Return only valid JSON without any markdown formatting.
  `;
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const extractedText = response.data.choices[0].message.content;
    return JSON.parse(extractedText);
    
  } catch (error) {
    console.error('Vision API error:', error);
    throw error;
  }
};

/**
 * Detect document type from buffer content
 * @param {Buffer} buffer 
 * @returns {boolean} true if salary slip
 */
const detectDocumentType = (buffer) => {
  // Simple heuristic for demo
  // In production, Vision API would handle this
  const text = buffer.toString('utf8', 0, Math.min(buffer.length, 500));
  const keywords = ['salary', 'payslip', 'earnings', 'deductions', 'gross'];
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
};

/**
 * Validate extracted data format
 * @param {Object} data 
 */
export const validateExtractedData = (data) => {
  const errors = [];
  
  if (data.pan && !isValidPAN(data.pan)) {
    errors.push('Invalid PAN format');
  }
  
  if (data.monthlySalary && (isNaN(data.monthlySalary) || data.monthlySalary < 0)) {
    errors.push('Invalid salary amount');
  }
  
  if (!data.name || data.name.length < 3) {
    errors.push('Invalid name');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate PAN format (5 letters + 4 digits + 1 letter)
 */
const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  return panRegex.test(pan);
};

export default {
  extractDocumentData,
  validateExtractedData
};
