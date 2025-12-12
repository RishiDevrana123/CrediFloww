/**
 * UNDERWRITING AGENT
 * 
 * Purpose: Make final loan approval decision based on all verifications
 * Decision Logic: creditScore, preApprovedLimit, DTI ratio, KYC status
 * 
 * Returns: { decision: "APPROVED" | "PENDING" | "REJECTED", details: Object }
 */

/**
 * Make underwriting decision
 * @param {Object} params - All verification results and loan details
 * @returns {Object} Underwriting decision
 */
export const makeUnderwritingDecision = async (params) => {
  const {
    loanAmount,
    tenureMonths,
    kycResult,
    salaryResult,
    mobile,
    fullName
  } = params;
  
  console.log('⚖️ Underwriting Agent: Analyzing application', { loanAmount, tenureMonths });
  
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const reasons = [];
    let decision = 'APPROVED';
    let requiresSalarySlip = false;
    
    // Step 1: Get or generate credit score
    const creditScore = getCreditScore(mobile, kycResult);
    
    // Step 2: Check minimum credit score (Customizable threshold)
    const MIN_CREDIT_SCORE = 700;
    if (creditScore < MIN_CREDIT_SCORE) {
      reasons.push(`Credit score too low (${creditScore} < ${MIN_CREDIT_SCORE})`);
      decision = 'REJECTED';
      
      console.log(`❌ Underwriting Agent: REJECTED due to low credit score`);
      
      return {
        decision,
        reasons,
        creditScore,
        preApprovedLimit: 0,
        sanctionUrl: null,
        requiresSalarySlip: false
      };
    }
    
    // Step 3: Calculate pre-approved limit
    let preApprovedLimit;
    let monthlySalary = null;
    
    if (salaryResult && salaryResult.status === 'VERIFIED') {
      // If salary slip is verified, use actual salary
      monthlySalary = salaryResult.details.monthlySalary;
      preApprovedLimit = calculatePreApprovedLimit(monthlySalary, creditScore);
      reasons.push(`Pre-approved limit calculated from verified salary: ₹${monthlySalary}`);
    } else {
      // Use estimated salary based on mobile/profile
      const estimatedSalary = estimateSalary(mobile, kycResult);
      monthlySalary = estimatedSalary;
      preApprovedLimit = calculatePreApprovedLimit(estimatedSalary, creditScore, 0.5); // Conservative multiplier
      reasons.push(`Pre-approved limit estimated (salary slip not provided)`);
    }
    
    // Step 4: Compare loan amount with pre-approved limit
    if (loanAmount <= preApprovedLimit) {
      // Direct approval
      decision = 'APPROVED';
      reasons.push(`Loan amount within pre-approved limit (₹${preApprovedLimit.toLocaleString()})`);
      
    } else if (loanAmount <= preApprovedLimit * 2) {
      // Needs salary slip verification
      if (salaryResult && salaryResult.status === 'VERIFIED') {
        // Already have salary slip, check if it's sufficient
        if (salaryResult.details.maxEligibleLoan >= loanAmount) {
          decision = 'APPROVED';
          reasons.push('Approved based on verified salary slip');
        } else {
          decision = 'REJECTED';
          reasons.push(`Requested amount exceeds maximum eligible (₹${salaryResult.details.maxEligibleLoan})`);
        }
      } else {
        // Need salary slip
        decision = 'PENDING';
        requiresSalarySlip = true;
        reasons.push('Salary slip required for this loan amount');
      }
      
    } else {
      // Exceeds maximum possible limit
      decision = 'REJECTED';
      reasons.push(`Requested amount significantly exceeds eligibility (${((loanAmount / preApprovedLimit - 1) * 100).toFixed(0)}% over limit)`);
    }
    
    // Step 5: Check KYC verification status
    if (kycResult && kycResult.status === 'FAILED') {
      decision = 'REJECTED';
      reasons.push('KYC verification failed');
      reasons.push(...kycResult.reasons);
    }
    
    // Step 6: Calculate EMI
    const emi = calculateEMI(loanAmount, tenureMonths, getInterestRate(creditScore));
    const maxAllowedEmi = monthlySalary * 0.5;
    
    if (emi > maxAllowedEmi && decision === 'APPROVED') {
      decision = 'REJECTED';
      reasons.push(`EMI (₹${Math.round(emi)}) exceeds 50% of monthly income (₹${Math.round(maxAllowedEmi)})`);
    }
    
    // Step 7: Generate sanction URL if approved
    let sanctionUrl = null;
    if (decision === 'APPROVED') {
      const sanctionId = generateSanctionId();
      sanctionUrl = `/api/sanction-letter/${sanctionId}`;
      
      // Store sanction data for PDF generation
      storeSanctionData(sanctionId, {
        fullName,
        mobile,
        loanAmount,
        tenureMonths,
        emi,
        interestRate: getInterestRate(creditScore),
        creditScore,
        approvedAt: new Date()
      });
    }
    
    console.log(`✅ Underwriting Agent: ${decision}`, {
      creditScore,
      preApprovedLimit,
      sanctionUrl
    });
    
    return {
      decision,
      reasons,
      creditScore,
      preApprovedLimit: Math.round(preApprovedLimit),
      emi: decision === 'APPROVED' ? Math.round(emi) : null,
      maxAllowedEmi: Math.round(maxAllowedEmi),
      interestRate: getInterestRate(creditScore),
      sanctionUrl,
      requiresSalarySlip
    };
    
  } catch (error) {
    console.error('❌ Underwriting Agent: Error', error);
    return {
      decision: 'REJECTED',
      reasons: ['Internal underwriting error'],
      error: error.message
    };
  }
};

/**
 * Get or generate credit score
 * Customizable: Replace with actual credit bureau API (CIBIL, Experian)
 */
const getCreditScore = (mobile, kycResult) => {
  // If we have CRM data with credit score, use it
  if (kycResult && kycResult.crmData && kycResult.crmData.creditScore) {
    return kycResult.crmData.creditScore;
  }
  
  // Otherwise, generate mock credit score (650-850 range)
  // In production, call actual credit bureau API
  const mockScore = 650 + Math.floor(Math.random() * 200);
  return mockScore;
};

/**
 * Calculate pre-approved limit based on salary and credit score
 * Formula: (Monthly Salary × 12 × Multiplier)
 * Multiplier varies by credit score
 * 
 * Customizable: Adjust multipliers based on business rules
 */
const calculatePreApprovedLimit = (monthlySalary, creditScore, customMultiplier = null) => {
  // Default multiplier based on credit score
  let multiplier = customMultiplier;
  
  if (multiplier === null) {
    if (creditScore >= 800) {
      multiplier = 0.8; // 80% of annual salary
    } else if (creditScore >= 750) {
      multiplier = 0.7;
    } else if (creditScore >= 700) {
      multiplier = 0.6;
    } else {
      multiplier = 0.5;
    }
  }
  
  return monthlySalary * 12 * multiplier;
};

/**
 * Estimate salary if not provided
 * Customizable: Use ML model or industry data
 */
const estimateSalary = (mobile, kycResult) => {
  // Simple estimation based on city/profile
  // In production, use ML model or bureau data
  
  if (kycResult && kycResult.crmData) {
    const city = kycResult.crmData.address;
    
    // City-based salary estimates (Customizable)
    const cityEstimates = {
      'Delhi': 40000,
      'Mumbai': 45000,
      'Bangalore': 42000,
      'Hyderabad': 38000,
      'Chennai': 36000,
      'Pune': 38000
    };
    
    return cityEstimates[city] || 30000;
  }
  
  return 30000; // Default estimate
};

/**
 * Calculate EMI
 * Formula: [P × r × (1+r)^n] / [(1+r)^n - 1]
 */
const calculateEMI = (principal, tenureMonths, annualInterestRate) => {
  const monthlyRate = annualInterestRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return emi;
};

/**
 * Get interest rate based on credit score
 * Customizable: Adjust rates based on market conditions
 */
const getInterestRate = (creditScore) => {
  if (creditScore >= 800) return 8.5;
  if (creditScore >= 750) return 9.5;
  if (creditScore >= 700) return 10.5;
  return 11.5;
};

/**
 * Generate unique sanction ID
 */
const generateSanctionId = () => {
  return 'SL' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// In-memory storage for sanction data
const sanctionDataStore = {};

/**
 * Store sanction data for PDF generation
 */
const storeSanctionData = (sanctionId, data) => {
  sanctionDataStore[sanctionId] = data;
};

/**
 * Get sanction data by ID
 */
export const getSanctionData = (sanctionId) => {
  return sanctionDataStore[sanctionId] || null;
};

export default {
  makeUnderwritingDecision,
  getSanctionData
};
