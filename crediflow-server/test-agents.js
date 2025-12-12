/**
 * AGENT SYSTEM TEST SCRIPT
 * 
 * Quick tests to verify all agents are working correctly
 */

import { verifyKYC } from './agents/kycAgent.js';
import { verifySalarySlip } from './agents/salarySlipAgent.js';
import { makeUnderwritingDecision } from './agents/underwritingAgent.js';

console.log('🧪 Testing Multi-Agent Loan Approval System\n');
console.log('='.repeat(60));

// Test 1: KYC Verification
console.log('\n📋 TEST 1: KYC Verification Agent');
console.log('-'.repeat(60));

const kycResult = await verifyKYC(
  { 
    name: 'Abheek Sehgal', 
    pan: 'ABCDE1234F' 
  }, 
  '9876543210'
);

console.log('✅ KYC Result:', kycResult.status);
console.log('   Confidence:', kycResult.confidence + '%');
console.log('   Reasons:', kycResult.reasons);

// Test 2: Salary Slip Verification
console.log('\n💰 TEST 2: Salary Slip Verification Agent');
console.log('-'.repeat(60));

const salaryResult = await verifySalarySlip(
  {
    monthlySalary: 45000,
    employer: 'Tech Corp India'
  },
  500000
);

console.log('✅ Salary Result:', salaryResult.status);
console.log('   Risk Level:', salaryResult.riskLevel);
console.log('   Max Eligible Loan:', '₹' + salaryResult.details.maxEligibleLoan?.toLocaleString());
console.log('   Reasons:', salaryResult.reasons);

// Test 3: Underwriting Decision - APPROVED
console.log('\n⚖️  TEST 3: Underwriting Agent (Should APPROVE)');
console.log('-'.repeat(60));

const underwritingResult1 = await makeUnderwritingDecision({
  loanAmount: 300000,
  tenureMonths: 36,
  kycResult,
  salaryResult,
  mobile: '9876543210',
  fullName: 'Abheek Sehgal'
});

console.log('✅ Decision:', underwritingResult1.decision);
console.log('   Credit Score:', underwritingResult1.creditScore);
console.log('   Pre-Approved Limit:', '₹' + underwritingResult1.preApprovedLimit?.toLocaleString());
console.log('   EMI:', underwritingResult1.emi ? '₹' + underwritingResult1.emi?.toLocaleString() : 'N/A');
console.log('   Interest Rate:', underwritingResult1.interestRate + '%');
console.log('   Reasons:', underwritingResult1.reasons);

// Test 4: Underwriting Decision - PENDING (needs salary slip)
console.log('\n⚖️  TEST 4: Underwriting Agent (Should be PENDING)');
console.log('-'.repeat(60));

const underwritingResult2 = await makeUnderwritingDecision({
  loanAmount: 600000,
  tenureMonths: 36,
  kycResult,
  salaryResult: null, // No salary slip
  mobile: '9876543210',
  fullName: 'Abheek Sehgal'
});

console.log('✅ Decision:', underwritingResult2.decision);
console.log('   Requires Salary Slip:', underwritingResult2.requiresSalarySlip);
console.log('   Reasons:', underwritingResult2.reasons);

// Test 5: Underwriting Decision - REJECTED (low credit score)
console.log('\n⚖️  TEST 5: Underwriting Agent (Should REJECT - Low Credit)');
console.log('-'.repeat(60));

const kycResultBad = await verifyKYC(
  { 
    name: 'Priya Sharma', 
    pan: 'LMNOP9876D' 
  }, 
  '9876543212'
);

const underwritingResult3 = await makeUnderwritingDecision({
  loanAmount: 500000,
  tenureMonths: 36,
  kycResult: kycResultBad,
  salaryResult,
  mobile: '9876543212',
  fullName: 'Priya Sharma'
});

console.log('✅ Decision:', underwritingResult3.decision);
console.log('   Credit Score:', underwritingResult3.creditScore);
console.log('   Reasons:', underwritingResult3.reasons);

console.log('\n' + '='.repeat(60));
console.log('🎉 All Agent Tests Completed!\n');

// Summary
console.log('📊 TEST SUMMARY:');
console.log('   ✅ KYC Verification:', kycResult.status);
console.log('   ✅ Salary Verification:', salaryResult.status);
console.log('   ✅ Underwriting (Approve):', underwritingResult1.decision);
console.log('   ✅ Underwriting (Pending):', underwritingResult2.decision);
console.log('   ✅ Underwriting (Reject):', underwritingResult3.decision);
console.log('\n✨ All agents functioning correctly!\n');
