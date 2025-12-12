/**
 * SALARY SLIP VERIFICATION AGENT
 * 
 * Purpose: Verify salary information and employer authenticity
 * Checks: Minimum salary, Employer validation, Salary consistency
 * 
 * Returns: { status: "VERIFIED" | "FAILED" | "FLAGGED", reason: string, details: Object }
 */

// Mock Employer Database - Replace with actual employer verification service
const MOCK_EMPLOYER_DB = {
  'Tech Corp India': {
    verified: true,
    industry: 'IT',
    size: 'Large',
    creditRating: 'A'
  },
  'Infosys Limited': {
    verified: true,
    industry: 'IT',
    size: 'Large',
    creditRating: 'A+'
  },
  'TCS': {
    verified: true,
    industry: 'IT',
    size: 'Large',
    creditRating: 'A+'
  },
  'Wipro': {
    verified: true,
    industry: 'IT',
    size: 'Large',
    creditRating: 'A'
  },
  'Small Startup Pvt Ltd': {
    verified: false,
    industry: 'IT',
    size: 'Small',
    creditRating: 'B'
  }
};

// Customizable: Adjust minimum salary requirement
const MINIMUM_SALARY = 15000;
const RECOMMENDED_SALARY = 25000;

/**
 * Verify salary slip data
 * @param {Object} extractedData - Data from Document Extraction Agent
 * @param {number} requestedLoanAmount - Loan amount requested by user
 * @returns {Object} Verification result
 */
export const verifySalarySlip = async (extractedData, requestedLoanAmount = 0) => {
  console.log('💰 Salary Slip Verification Agent: Starting verification', extractedData);
  
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { monthlySalary, employer } = extractedData;
    const issues = [];
    let status = 'VERIFIED';
    let riskLevel = 'LOW';
    
    // Step 1: Check minimum salary requirement
    if (!monthlySalary || monthlySalary < MINIMUM_SALARY) {
      issues.push(`Salary below minimum requirement (₹${MINIMUM_SALARY})`);
      status = 'FAILED';
      riskLevel = 'HIGH';
    } else if (monthlySalary < RECOMMENDED_SALARY) {
      issues.push('Salary below recommended threshold');
      status = 'FLAGGED';
      riskLevel = 'MEDIUM';
    }
    
    // Step 2: Verify employer exists and is valid
    let employerData = null;
    if (employer) {
      employerData = MOCK_EMPLOYER_DB[employer];
      
      if (!employerData) {
        issues.push('Employer not found in database');
        status = 'FLAGGED';
        riskLevel = 'MEDIUM';
      } else if (!employerData.verified) {
        issues.push('Employer not verified');
        status = 'FLAGGED';
        riskLevel = 'MEDIUM';
      }
    } else {
      issues.push('Employer information missing');
      status = 'FLAGGED';
      riskLevel = 'MEDIUM';
    }
    
    // Step 3: Calculate debt-to-income ratio if loan amount provided
    let dtiRatio = null;
    let maxEligibleLoan = null;
    
    if (monthlySalary && requestedLoanAmount) {
      // Assume max EMI = 50% of monthly salary
      const maxEMI = monthlySalary * 0.5;
      
      // Calculate EMI for requested loan (assuming 10% interest, 36 months)
      const interestRate = 0.10;
      const tenure = 36;
      const monthlyRate = interestRate / 12;
      const requestedEMI = (requestedLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                           (Math.pow(1 + monthlyRate, tenure) - 1);
      
      dtiRatio = (requestedEMI / monthlySalary) * 100;
      
      // Calculate max eligible loan
      maxEligibleLoan = (maxEMI * (Math.pow(1 + monthlyRate, tenure) - 1)) / 
                        (monthlyRate * Math.pow(1 + monthlyRate, tenure));
      
      if (dtiRatio > 50) {
        issues.push(`Debt-to-income ratio too high (${dtiRatio.toFixed(1)}%)`);
        status = 'FAILED';
        riskLevel = 'HIGH';
      } else if (dtiRatio > 40) {
        issues.push(`Debt-to-income ratio elevated (${dtiRatio.toFixed(1)}%)`);
        if (status === 'VERIFIED') status = 'FLAGGED';
        riskLevel = 'MEDIUM';
      }
    }
    
    // Step 4: Cross-check salary consistency
    const salaryConsistency = checkSalaryConsistency(monthlySalary, employer);
    if (!salaryConsistency.consistent) {
      issues.push(salaryConsistency.reason);
      if (status === 'VERIFIED') status = 'FLAGGED';
    }
    
    // If no issues found
    if (issues.length === 0) {
      issues.push('All salary verification checks passed');
    }
    
    console.log(`✅ Salary Slip Verification Agent: ${status}`, { riskLevel, issues });
    
    return {
      status,
      reasons: issues,
      riskLevel,
      details: {
        monthlySalary,
        employer,
        employerVerified: employerData?.verified || false,
        dtiRatio: dtiRatio ? dtiRatio.toFixed(2) : null,
        maxEligibleLoan: maxEligibleLoan ? Math.round(maxEligibleLoan) : null,
        minimumSalaryMet: monthlySalary >= MINIMUM_SALARY
      }
    };
    
  } catch (error) {
    console.error('❌ Salary Slip Verification Agent: Error', error);
    return {
      status: 'FAILED',
      reasons: ['Internal verification error'],
      riskLevel: 'HIGH',
      error: error.message
    };
  }
};

/**
 * Check if salary is consistent with employer and industry standards
 * Customizable: Add industry-specific salary ranges
 */
const checkSalaryConsistency = (salary, employer) => {
  if (!employer) {
    return { consistent: true, reason: null };
  }
  
  const employerData = MOCK_EMPLOYER_DB[employer];
  if (!employerData) {
    return { consistent: true, reason: null };
  }
  
  // Define industry salary ranges (customizable)
  const industrySalaryRanges = {
    'IT': { min: 25000, max: 200000 },
    'Finance': { min: 30000, max: 150000 },
    'Manufacturing': { min: 15000, max: 100000 },
    'Retail': { min: 12000, max: 60000 }
  };
  
  const range = industrySalaryRanges[employerData.industry];
  if (range) {
    if (salary < range.min) {
      return {
        consistent: false,
        reason: `Salary below expected range for ${employerData.industry} industry`
      };
    }
    if (salary > range.max) {
      return {
        consistent: false,
        reason: `Salary above expected range for ${employerData.industry} industry (needs verification)`
      };
    }
  }
  
  return { consistent: true, reason: null };
};

/**
 * Calculate maximum eligible loan based on salary
 * Customizable: Adjust EMI ratio and interest rate assumptions
 */
export const calculateMaxLoan = (monthlySalary, tenure = 36, interestRate = 0.10) => {
  const maxEMI = monthlySalary * 0.5; // Max 50% of salary as EMI
  const monthlyRate = interestRate / 12;
  
  const maxLoan = (maxEMI * (Math.pow(1 + monthlyRate, tenure) - 1)) / 
                  (monthlyRate * Math.pow(1 + monthlyRate, tenure));
  
  return Math.round(maxLoan);
};

/**
 * Get employer data (for testing/demo)
 */
export const getEmployerData = (employerName) => {
  return MOCK_EMPLOYER_DB[employerName] || null;
};

/**
 * Add employer to database (for testing/demo)
 * Customizable: Replace with actual employer verification API
 */
export const addEmployer = (employerName, employerData) => {
  MOCK_EMPLOYER_DB[employerName] = {
    ...employerData,
    addedAt: new Date()
  };
  return MOCK_EMPLOYER_DB[employerName];
};

export default {
  verifySalarySlip,
  calculateMaxLoan,
  getEmployerData,
  addEmployer,
  MINIMUM_SALARY,
  RECOMMENDED_SALARY
};
