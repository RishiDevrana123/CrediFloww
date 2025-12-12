/**
 * KYC VERIFICATION AGENT - SIMPLIFIED VERSION
 * 
 * Purpose: Verify customer using uploaded documents (without AI vision)
 * Checks: Document presence, basic validation, application data consistency
 * 
 * Returns: { status: "VERIFIED" | "FAILED", reasons: [], confidence: number, creditScore: number }
 */

import stringSimilarity from 'string-similarity';

/**
 * Verify customer KYC using uploaded documents
 * @param {Object} customerData - { name, pan, aadhar, address, loanAmount, monthlyIncome }
 * @param {Object} uploadedDocuments - { panCard: filePath, aadharCard: filePath, salarySlip: filePath }
 * @returns {Object} - { status, confidence, reasons, creditScore, extractedData }
 */
export async function verifyKYC(customerData, uploadedDocuments) {
  console.log('🔍 Starting KYC Verification...');
  console.log('Customer Data:', customerData);
  console.log('Uploaded Documents:', uploadedDocuments);

  const reasons = [];
  let confidence = 1.0;
  
  try {
    // ========== STEP 1: CHECK REQUIRED DOCUMENTS ==========
    if (!uploadedDocuments.panCard && !uploadedDocuments.aadharCard) {
      return {
        status: 'FAILED',
        confidence: 0,
        reasons: ['No identity documents uploaded. Please upload PAN or Aadhar card.'],
        creditScore: 0,
        extractedData: {},
        verifiedAt: new Date().toISOString()
      };
    }

    // ========== STEP 2: VALIDATE PAN CARD ==========
    if (uploadedDocuments.panCard) {
      console.log('✅ PAN card uploaded');
      reasons.push('PAN card document uploaded');
      
      // Validate PAN format from application
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (customerData.pan && panPattern.test(customerData.pan)) {
        reasons.push(`PAN format valid: ${customerData.pan}`);
      } else {
        reasons.push('PAN format invalid');
        confidence -= 0.2;
      }
    } else {
      reasons.push('PAN card not uploaded');
      confidence -= 0.3;
    }

    // ========== STEP 3: VALIDATE AADHAR CARD ==========
    if (uploadedDocuments.aadharCard) {
      console.log('✅ Aadhar card uploaded');
      reasons.push('Aadhar card document uploaded');
      
      // Validate Aadhar format from application
      const aadharNumber = customerData.aadhar?.replace(/\s/g, '');
      if (aadharNumber && /^\d{12}$/.test(aadharNumber)) {
        reasons.push('Aadhar format valid (12 digits)');
      } else {
        reasons.push('Aadhar format invalid');
        confidence -= 0.2;
      }
    } else {
      reasons.push('Aadhar card not uploaded');
      confidence -= 0.2;
    }

    // ========== STEP 4: VALIDATE BASIC DATA ==========
    // Check name
    if (customerData.name && customerData.name.length >= 3) {
      reasons.push('Name provided');
    } else {
      reasons.push('Name too short');
      confidence -= 0.1;
    }

    // Check address
    if (customerData.address && customerData.address.length >= 5) {
      reasons.push('Address provided');
    } else {
      reasons.push('Address incomplete');
      confidence -= 0.1;
    }

    // ========== STEP 5: CHECK SALARY SLIP (OPTIONAL) ==========
    let monthlyIncome = customerData.monthlyIncome || 30000;
    
    if (uploadedDocuments.salarySlip) {
      console.log('✅ Salary slip uploaded');
      reasons.push('Salary slip uploaded for income verification');
      
      if (customerData.monthlyIncome && customerData.monthlyIncome >= 15000) {
        monthlyIncome = customerData.monthlyIncome;
        reasons.push(`Monthly income: ₹${monthlyIncome.toLocaleString('en-IN')}`);
      } else {
        reasons.push('Monthly income below minimum (₹15,000)');
        confidence -= 0.2;
      }
    } else {
      reasons.push('Salary slip not uploaded (using estimated income)');
      confidence -= 0.1;
    }

    // ========== STEP 6: CALCULATE CREDIT SCORE ==========
    // Simple credit score based on income and loan amount
    let creditScore = 700; // Default base score
    
    const loanAmount = customerData.loanAmount || 0;
    const loanToIncomeRatio = loanAmount / (monthlyIncome * 12);
    
    if (monthlyIncome >= 50000) {
      creditScore = 780; // High income
    } else if (monthlyIncome >= 30000) {
      creditScore = 720; // Good income
    } else if (monthlyIncome >= 20000) {
      creditScore = 680; // Average income
    } else {
      creditScore = 620; // Low income
    }
    
    // Adjust based on loan-to-income ratio
    if (loanToIncomeRatio > 5) {
      creditScore -= 50; // High risk
      reasons.push('Loan amount high relative to income');
    } else if (loanToIncomeRatio > 3) {
      creditScore -= 20;
    }
    
    // Both documents boost score
    if (uploadedDocuments.panCard && uploadedDocuments.aadharCard) {
      creditScore += 20;
      reasons.push('Both identity documents provided');
    }
    
    // Salary slip boosts score
    if (uploadedDocuments.salarySlip) {
      creditScore += 10;
    }
    
    creditScore = Math.max(300, Math.min(900, creditScore)); // Clamp between 300-900
    
    const creditCategory = creditScore >= 750 ? 'Excellent' : 
                          creditScore >= 700 ? 'Good' : 
                          creditScore >= 650 ? 'Fair' : 'Poor';
    
    reasons.push(`Credit score: ${creditScore} (${creditCategory})`);

    // ========== FINAL DECISION ==========
    confidence = Math.max(0, Math.min(1, confidence)); // Clamp between 0-1

    const status = (confidence >= 0.6 && creditScore >= 650) ? 'VERIFIED' : 'FAILED';

    if (status === 'FAILED') {
      if (confidence < 0.6) {
        reasons.push('⚠️ Insufficient document verification confidence');
      }
      if (creditScore < 650) {
        reasons.push('⚠️ Credit score below minimum threshold (650)');
      }
    } else {
      reasons.push('✅ All checks passed - Application verified');
    }

    console.log(`✅ KYC Result: ${status} (Confidence: ${(confidence * 100).toFixed(0)}%, Credit: ${creditScore})`);

    return {
      status,
      confidence,
      reasons,
      creditScore,
      creditCategory,
      riskLevel: creditScore >= 700 ? 'Low' : creditScore >= 650 ? 'Medium' : 'High',
      extractedData: {
        monthlyIncome,
        documentsProvided: {
          pan: !!uploadedDocuments.panCard,
          aadhar: !!uploadedDocuments.aadharCard,
          salary: !!uploadedDocuments.salarySlip
        }
      },
      verifiedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ KYC Verification Error:', error);
    return {
      status: 'FAILED',
      confidence: 0,
      reasons: ['System error during verification: ' + error.message],
      creditScore: 0,
      extractedData: {},
      verifiedAt: new Date().toISOString()
    };
  }
}

export default {
  verifyKYC
};
