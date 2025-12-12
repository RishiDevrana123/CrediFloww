import Application from '../models/Application.model.js';
import { verifyKYC } from '../agents/kycAgent.js';
import { verifySalarySlip } from '../agents/salarySlipAgent.js';
import { makeUnderwritingDecision } from '../agents/underwritingAgent.js';
import { generateSanctionLetter } from '../agents/sanctionAgent.js';

// Process chat message and generate bot response
export const processMessage = async (req, res) => {
  try {
    const { applicationId, message, stage } = req.body;

    let application = await Application.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }

    // Add user message to chat history
    application.chatHistory.push({
      sender: 'user',
      message,
    });

    // Generate bot response based on stage
    const botResponse = generateBotResponse(message, stage, application);

    // Add bot response to chat history
    application.chatHistory.push({
      sender: 'bot',
      message: botResponse.message,
    });

    // Update application data if needed
    if (botResponse.updates) {
      Object.assign(application, botResponse.updates);
    }

    await application.save();

    res.json({
      status: 'success',
      data: {
        response: botResponse.message,
        nextStage: botResponse.nextStage,
        application,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const application = await Application.findOne({
      applicationId: req.params.applicationId,
    });

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found',
      });
    }

    res.json({
      status: 'success',
      data: application.chatHistory,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * Trigger KYC Verification
 * Called when application moves to verification stage
 */
export const triggerKYCVerification = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({ applicationId });
    
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }
    
    console.log('🔍 Starting KYC verification for:', application.fullName);
    
    // Get uploaded document paths
    const uploadedDocuments = {};
    application.documents.forEach(doc => {
      if (doc.type === 'pan') {
        uploadedDocuments.panCard = doc.path;
      } else if (doc.type === 'aadhar') {
        uploadedDocuments.aadharCard = doc.path;
      } else if (doc.type === 'salary-slip') {
        uploadedDocuments.salarySlip = doc.path;
      }
    });
    
    // Check if required documents are uploaded
    if (!uploadedDocuments.panCard && !uploadedDocuments.aadharCard) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload at least PAN card or Aadhar card for KYC verification'
      });
    }
    
    // Step 1: Run KYC Agent with uploaded documents
    const kycResult = await verifyKYC(
      {
        name: application.fullName,
        pan: application.panCard,
        aadhar: application.aadharNumber,
        address: application.address || '',
        loanAmount: application.loanAmount,
        monthlyIncome: application.monthlyIncome
      },
      uploadedDocuments
    );
    
    // Update application with KYC result
    application.kycVerificationStatus = kycResult.status;
    application.kycVerificationDetails = {
      confidence: kycResult.confidence,
      reasons: kycResult.reasons,
      verifiedAt: new Date(),
      creditScore: kycResult.creditScore,
      extractedData: kycResult.extractedData
    };
    
    // Add chat message about KYC result
    if (kycResult.status === 'VERIFIED') {
      application.chatHistory.push({
        sender: 'bot',
        message: `✅ KYC Verification Complete!\n\n` +
                `Your identity has been verified successfully.\n` +
                `Confidence: ${(kycResult.confidence * 100).toFixed(0)}%\n` +
                `Credit Score: ${kycResult.creditScore} (${kycResult.creditCategory})\n\n` +
                `Moving to underwriting decision...`
      });
      
      // Move to next stage if KYC passes
      application.stage = 'verification';
      
    } else {
      application.chatHistory.push({
        sender: 'bot',
        message: `❌ KYC Verification Failed\n\n` +
                `Reasons:\n- ` + kycResult.reasons.join('\n- ') + '\n\n' +
                `Please ensure your documents are clear and match your application details.`
      });
      
      application.status = 'rejected';
      application.rejectionReason = 'KYC verification failed: ' + kycResult.reasons.join(', ');
    }
    
    await application.save();
    
    res.json({
      status: 'success',
      kycResult,
      application
    });
    
  } catch (error) {
    console.error('❌ KYC verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify KYC',
      error: error.message
    });
  }
};

/**
 * Trigger Underwriting Decision
 * Called after verification stage completes
 */
export const triggerUnderwriting = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({ applicationId });
    
    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }
    
    console.log('⚖️  Starting underwriting for:', application.fullName);
    
    // Prepare KYC result from stored data
    const kycResult = {
      status: application.kycVerificationStatus,
      confidence: application.kycVerificationDetails?.confidence || 0,
      reasons: application.kycVerificationDetails?.reasons || []
    };
    
    // Prepare salary result if available
    let salaryResult = null;
    if (application.monthlyIncome) {
      salaryResult = await verifySalarySlip(
        {
          monthlySalary: application.monthlyIncome,
          employer: application.companyName
        },
        application.loanAmount
      );
    }
    
    // Run Underwriting Agent
    const underwritingResult = await makeUnderwritingDecision({
      loanAmount: application.loanAmount,
      tenureMonths: application.tenure,
      kycResult,
      salaryResult,
      mobile: application.phone,
      fullName: application.fullName
    });
    
    // Update application with underwriting decision
    application.underwritingDecision = underwritingResult.decision;
    application.creditScore = underwritingResult.creditScore;
    application.interestRate = underwritingResult.interestRate;
    
    // Handle decision
    if (underwritingResult.decision === 'APPROVED') {
      application.status = 'approved';
      application.approvedAmount = application.loanAmount;
      application.approvedTenure = application.tenure;
      application.emi = underwritingResult.emi;
      application.stage = 'completed';
      
      // Generate sanction letter
      if (underwritingResult.sanctionUrl) {
        const sanctionId = underwritingResult.sanctionUrl.split('/').pop();
        application.sanctionLetterId = sanctionId;
      }
      
      application.chatHistory.push({
        sender: 'bot',
        message: `🎉 Congratulations! Your loan has been APPROVED!\n\n` +
                `Approved Amount: ₹${application.approvedAmount.toLocaleString()}\n` +
                `Interest Rate: ${application.interestRate}% p.a.\n` +
                `Monthly EMI: ₹${Math.round(application.emi).toLocaleString()}\n` +
                `Tenure: ${application.approvedTenure} months\n` +
                `Credit Score: ${application.creditScore}\n\n` +
                `Your sanction letter will be available shortly!`
      });
      
    } else if (underwritingResult.decision === 'PENDING') {
      application.status = 'under-review';
      application.stage = 'underwriting';
      
      application.chatHistory.push({
        sender: 'bot',
        message: `⏳ Your application needs additional verification\n\n` +
                underwritingResult.reasons.join('\n- ') + '\n\n' +
                `Please provide additional documents or information.`
      });
      
    } else { // REJECTED
      application.status = 'rejected';
      application.rejectionReason = underwritingResult.reasons.join(', ');
      
      application.chatHistory.push({
        sender: 'bot',
        message: `❌ Unfortunately, we cannot approve your loan at this time.\n\n` +
                `Reasons:\n- ${underwritingResult.reasons.join('\n- ')}\n\n` +
                `You may reapply after 3 months.`
      });
    }
    
    await application.save();
    
    res.json({
      status: 'success',
      underwritingResult,
      application
    });
    
  } catch (error) {
    console.error('❌ Underwriting error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process underwriting',
      error: error.message
    });
  }
};

// Helper function to generate bot responses
function generateBotResponse(message, stage, application) {
  const responses = {
    sales: {
      greeting: "Welcome to CrediFlow! I'm here to help you with your loan application. What type of loan are you interested in?",
      loanType: "Great choice! How much loan amount do you need?",
      loanAmount: "Perfect! For how many months would you like to repay this loan?",
      tenure: "Excellent! Let's proceed with your application. May I have your full name?",
    },
    verification: {
      personal: "Thank you! I need to verify some documents. Please upload your PAN card and Aadhar card.",
      documents: "Documents received! Our verification team will review them shortly.",
      verified: "Great news! Your documents have been verified successfully. Moving to underwriting...",
    },
    underwriting: {
      income: "To proceed with the underwriting, please provide your monthly income.",
      employment: "What is your employment type? (Salaried/Self-employed/Business)",
      assessment: "Thank you! Our underwriting team is assessing your application...",
    },
    sanction: {
      approved: `Congratulations! Your loan has been approved!\n\nApproved Amount: ₹${application.approvedAmount}\nInterest Rate: ${application.interestRate}% p.a.\nEMI: ₹${application.emi}\nTenure: ${application.approvedTenure} months`,
      rejected: `We're sorry, but your loan application couldn't be approved at this time. Reason: ${application.rejectionReason}`,
    },
  };

  // Simple logic to determine response (can be enhanced with NLP)
  if (stage === 'sales') {
    if (message.toLowerCase().includes('personal') || message.toLowerCase().includes('home')) {
      return {
        message: responses.sales.loanType,
        updates: { loanType: message.toLowerCase().includes('personal') ? 'personal' : 'home' },
      };
    }
  }

  return {
    message: "I understand. Let me help you with that. Could you provide more details?",
  };
}
