import Application from '../models/Application.model.js';

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
