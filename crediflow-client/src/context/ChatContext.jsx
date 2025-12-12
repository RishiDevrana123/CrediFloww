import React, { createContext, useContext, useState, useEffect } from 'react';
import { applicationAPI, chatAPI, socket } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  
  // User information
  const [user, setUser] = useState({
    id: 'user_' + Date.now(),
    name: 'Guest User',
  });

  // Update user when authenticated
  useEffect(() => {
    if (isAuthenticated && authUser) {
      setUser({
        id: authUser.id || authUser._id,
        name: authUser.fullName,
      });
    } else {
      setUser({
        id: 'user_' + Date.now(),
        name: 'Guest User',
      });
    }
  }, [isAuthenticated, authUser]);

  // Application ID from backend (MongoDB _id for API calls, applicationId for display)
  const [applicationId, setApplicationId] = useState(null);
  const [applicationMongoId, setApplicationMongoId] = useState(null);
  const [applicationData, setApplicationData] = useState(null);

  // Chat messages
  const [messages, setMessages] = useState([]);

  // Current loan stage: sales, verification, underwriting, sanction, completed
  const [currentStage, setCurrentStage] = useState('sales');

  // Track what information we're currently collecting
  const [collectingField, setCollectingField] = useState('loanType'); // loanType, name, email, phone, pan, aadhar, amount

  // Loan details
  const [loanDetails, setLoanDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    panCard: '',
    aadharNumber: '',
    loanType: '',
    requestedAmount: null,
    approvedAmount: null,
    interestRate: null,
    tenure: null,
    status: 'pending', // pending, approved, rejected
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeName = isAuthenticated && authUser ? authUser.fullName.split(' ')[0] : '';
      const welcomeText = welcomeName 
        ? `Welcome back, ${welcomeName}! 👋 I'm here to help you with your loan application. What type of loan are you looking for?`
        : 'Welcome to CrediFlow! 👋 I\'m here to help you with your loan application. Let\'s start by understanding your requirements. What type of loan are you looking for?';
      
      addMessage({
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date(),
      });
    }
  }, []);

  // Add a new message
  const addMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        ...message,
        timestamp: message.timestamp || new Date(),
      },
    ]);
  };

  // Send a user message and get bot response
  const sendMessage = async (text, file = null) => {
    // Add user message
    addMessage({
      sender: 'user',
      text,
      file,
    });

    setIsLoading(true);

    try {
      // Handle based on current stage
      await handleUserInput(text, file);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        sender: 'bot',
        text: 'Sorry, there was an error processing your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user input and create/update application
  const handleUserInput = async (text, file) => {
    const lowerMessage = text.toLowerCase();

    // Sales stage - gather information and create application
    if (currentStage === 'sales') {
      // Collect loan type
      if (collectingField === 'loanType') {
        if (lowerMessage.includes('personal')) {
          const updatedDetails = { ...loanDetails, loanType: 'personal' };
          
          // If user is authenticated, skip name/email/phone and auto-populate
          if (isAuthenticated && authUser) {
            updatedDetails.fullName = authUser.fullName;
            updatedDetails.email = authUser.email;
            updatedDetails.phone = authUser.phone;
            setLoanDetails(prev => ({ ...prev, ...updatedDetails }));
            setCollectingField('pan');
            addMessage({
              sender: 'bot',
              text: `Great! Personal loan selected for ${authUser.fullName}. What is your PAN card number?`,
            });
          } else {
            setLoanDetails(prev => ({ ...prev, loanType: 'personal' }));
            setCollectingField('name');
            addMessage({
              sender: 'bot',
              text: 'Great! Personal loan selected. What is your full name?',
            });
          }
        } else if (lowerMessage.includes('home')) {
          const updatedDetails = { ...loanDetails, loanType: 'home' };
          
          if (isAuthenticated && authUser) {
            updatedDetails.fullName = authUser.fullName;
            updatedDetails.email = authUser.email;
            updatedDetails.phone = authUser.phone;
            setLoanDetails(prev => ({ ...prev, ...updatedDetails }));
            setCollectingField('pan');
            addMessage({
              sender: 'bot',
              text: `Excellent! Home loan selected for ${authUser.fullName}. What is your PAN card number?`,
            });
          } else {
            setLoanDetails(prev => ({ ...prev, loanType: 'home' }));
            setCollectingField('name');
            addMessage({
              sender: 'bot',
              text: 'Excellent! Home loan selected. What is your full name?',
            });
          }
        } else if (lowerMessage.includes('business')) {
          const updatedDetails = { ...loanDetails, loanType: 'business' };
          
          if (isAuthenticated && authUser) {
            updatedDetails.fullName = authUser.fullName;
            updatedDetails.email = authUser.email;
            updatedDetails.phone = authUser.phone;
            setLoanDetails(prev => ({ ...prev, ...updatedDetails }));
            setCollectingField('pan');
            addMessage({
              sender: 'bot',
              text: `Perfect! Business loan selected for ${authUser.fullName}. What is your PAN card number?`,
            });
          } else {
            setLoanDetails(prev => ({ ...prev, loanType: 'business' }));
            setCollectingField('name');
            addMessage({
              sender: 'bot',
              text: 'Perfect! Business loan selected. What is your full name?',
            });
          }
        } else {
          addMessage({
            sender: 'bot',
            text: 'I can help you with Personal, Home, or Business loans. Which one would you like?',
          });
        }
      }
      // Collect name (only if not authenticated)
      else if (collectingField === 'name' && text.length > 2 && !lowerMessage.match(/\d/)) {
        setLoanDetails(prev => ({ ...prev, fullName: text }));
        setCollectingField('email');
        addMessage({
          sender: 'bot',
          text: `Nice to meet you, ${text}! What is your email address?`,
        });
      }
      // Collect email (only if not authenticated)
      else if (collectingField === 'email' && text.includes('@')) {
        setLoanDetails(prev => ({ ...prev, email: text }));
        setCollectingField('phone');
        addMessage({
          sender: 'bot',
          text: 'Great! What is your phone number (10 digits)?',
        });
      }
      // Collect phone (only if not authenticated)
      else if (collectingField === 'phone' && lowerMessage.match(/^\d{10}$/)) {
        setLoanDetails(prev => ({ ...prev, phone: text }));
        setCollectingField('pan');
        addMessage({
          sender: 'bot',
          text: 'Perfect! What is your PAN card number?',
        });
      }
      // Collect PAN
      else if (collectingField === 'pan' && text.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/i)) {
        setLoanDetails(prev => ({ ...prev, panCard: text.toUpperCase() }));
        setCollectingField('aadhar');
        addMessage({
          sender: 'bot',
          text: 'Thank you! What is your Aadhar number (12 digits)?',
        });
      }
      // Collect Aadhar
      else if (collectingField === 'aadhar' && lowerMessage.match(/^\d{12}$/)) {
        setLoanDetails(prev => ({ ...prev, aadharNumber: text }));
        setCollectingField('amount');
        addMessage({
          sender: 'bot',
          text: 'Excellent! How much loan amount do you need?',
        });
      }
      // Collect amount and create application
      else if (collectingField === 'amount' && lowerMessage.match(/\d+/) && !applicationId) {
        const amount = parseInt(lowerMessage.match(/\d+/)[0]);
        
        // Create application in backend
        try {
          const applicationData = {
            fullName: loanDetails.fullName,
            email: loanDetails.email,
            phone: loanDetails.phone,
            panCard: loanDetails.panCard,
            aadharNumber: loanDetails.aadharNumber,
            loanType: loanDetails.loanType || 'personal',
            loanAmount: amount,
            tenure: 36, // default tenure
          };

          // Add userId if user is authenticated
          if (isAuthenticated && authUser && authUser.id) {
            applicationData.userId = authUser.id;
          }

          console.log('📤 Sending application data:', applicationData);
          const newApplication = await applicationAPI.create(applicationData);

          console.log('✅ Application created:', newApplication);
          
          setApplicationId(newApplication.data.applicationId);
          setApplicationMongoId(newApplication.data._id);
          setApplicationData(newApplication.data);
          setLoanDetails(prev => ({ ...prev, requestedAmount: amount }));
          setCollectingField('documents');
          
          addMessage({
            sender: 'bot',
            text: `Perfect! Your application ${newApplication.data.applicationId} has been created for ₹${amount}.\n\n📄 **Next Step: Document Upload**\n\nPlease upload the following documents:\n\n1️⃣ **PAN Card** (Required) - Include "pan" in filename\n2️⃣ **Aadhar Card** (Required) - Include "aadhar" in filename\n3️⃣ **Salary Slip** (Optional) - Include "salary" in filename\n\n💡 Example: pan_card.jpg, aadhar_front.jpg, salary_slip.pdf\n\nUse the paperclip icon 📎 below to upload, then type "done" for instant verification!`,
          });
          setCurrentStage('verification');
        } catch (error) {
          console.error('❌ Error creating application:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
          addMessage({
            sender: 'bot',
            text: `Sorry, there was an error creating your application: ${errorMessage}. Please try again or contact support.`,
          });
        }
      } else {
        // Invalid input for current field
        let errorMsg = 'I didn\'t quite understand that. ';
        if (collectingField === 'name') errorMsg += 'Please enter your full name.';
        else if (collectingField === 'email') errorMsg += 'Please enter a valid email address.';
        else if (collectingField === 'phone') errorMsg += 'Please enter a 10-digit phone number.';
        else if (collectingField === 'pan') errorMsg += 'Please enter a valid PAN card number (e.g., ABCDE1234F).';
        else if (collectingField === 'aadhar') errorMsg += 'Please enter a 12-digit Aadhar number.';
        else if (collectingField === 'amount') errorMsg += 'Please enter the loan amount in numbers.';
        
        addMessage({
          sender: 'bot',
          text: errorMsg,
        });
      }
    }
    // Verification stage
    else if (currentStage === 'verification') {
      if (file && applicationId) {
        // Upload document to backend
        try {
          const formData = new FormData();
          formData.append('document', file);
          
          // Let backend AI identify document type by reading it
          formData.append('type', 'auto-detect');
          console.log(`📄 Uploading ${file.name} for AI identification...`);

          const response = await applicationAPI.uploadDocument(applicationData._id, formData);
          
          // Backend will return detected document type
          const detectedType = response.data.documents[response.data.documents.length - 1].type;
          const docTypeLabel = detectedType === 'pan' ? 'PAN Card' : 
                               detectedType === 'aadhar' ? 'Aadhar Card' : 
                               detectedType === 'salary-slip' ? 'Salary Slip' : 
                               detectedType === 'bank-statement' ? 'Bank Statement' :
                               'Document';
          
          addMessage({
            sender: 'bot',
            text: `✅ ${docTypeLabel} detected and uploaded!\n\nUpload more documents or type "done" when ready for verification.`,
          });
        } catch (error) {
          console.error('Error uploading document:', error);
          addMessage({
            sender: 'bot',
            text: 'Sorry, there was an error uploading your document. Please try again.',
          });
        }
      } else if (lowerMessage.includes('done') && applicationId) {
        // Trigger KYC verification with uploaded documents
        try {
          addMessage({
            sender: 'bot',
            text: '🔍 Verifying your documents using AI...',
          });
          
          const kycResponse = await chatAPI.verifyKYC(applicationId);
          console.log('✅ KYC Response:', kycResponse);
          
          if (kycResponse.kycResult.status === 'VERIFIED') {
            // KYC passed - proceed to underwriting
            addMessage({
              sender: 'bot',
              text: `✅ Identity Verified!\n\nConfidence: ${(kycResponse.kycResult.confidence * 100).toFixed(0)}%\nCredit Score: ${kycResponse.kycResult.creditScore} (${kycResponse.kycResult.creditCategory})\n\nEvaluating your loan application...`,
            });
            
            // Trigger underwriting
            const underwritingResponse = await chatAPI.triggerUnderwriting(applicationId);
            console.log('✅ Underwriting Response:', underwritingResponse);
            
            const decision = underwritingResponse.underwritingResult.decision;
            const updatedApp = underwritingResponse.application;
            
            if (decision === 'APPROVED') {
              setApplicationData(updatedApp);
              setLoanDetails(prev => ({
                ...prev,
                status: 'approved',
                approvedAmount: updatedApp.approvedAmount,
                interestRate: updatedApp.interestRate,
                emi: updatedApp.emi,
              }));
              
              addMessage({
                sender: 'bot',
                text: `🎉 Congratulations! Your loan is APPROVED!\n\n💰 Amount: ₹${updatedApp.approvedAmount.toLocaleString('en-IN')}\n📊 Credit Score: ${kycResponse.kycResult.creditScore}\n💳 Interest Rate: ${updatedApp.interestRate}%\n📅 Monthly EMI: ₹${updatedApp.emi.toLocaleString('en-IN')}\n\n✅ Your sanction letter is ready for download!`,
              });
              setCurrentStage('approved');
            } else if (decision === 'PENDING') {
              setApplicationData(updatedApp);
              setLoanDetails(prev => ({ ...prev, status: 'under-review' }));
              
              addMessage({
                sender: 'bot',
                text: `⏳ Application Under Manual Review\n\nOur team will contact you within 24-48 hours.\n\nReason: ${underwritingResponse.underwritingResult.reasons.join(', ')}`,
              });
              setCurrentStage('underwriting');
            } else {
              // REJECTED
              setApplicationData(updatedApp);
              setLoanDetails(prev => ({ ...prev, status: 'rejected' }));
              
              addMessage({
                sender: 'bot',
                text: `❌ Application Declined\n\nReason: ${underwritingResponse.underwritingResult.reasons.join(', ')}\n\nYou may reapply after 3 months or contact our support for assistance.`,
              });
              setCurrentStage('consultation');
            }
            
          } else {
            // KYC failed
            addMessage({
              sender: 'bot',
              text: `❌ Document Verification Failed\n\nReasons:\n- ${kycResponse.kycResult.reasons.join('\n- ')}\n\nPlease re-upload clear, legible documents or contact support.`,
            });
            setLoanDetails(prev => ({ ...prev, status: 'rejected' }));
          }
          
        } catch (error) {
          console.error('❌ Error in verification:', error);
          addMessage({
            sender: 'bot',
            text: `⚠️ Verification Error: ${error.response?.data?.message || error.message}\n\nPlease ensure you've uploaded at least PAN and Aadhar cards.`,
          });
        }
      } else if (lowerMessage.includes('done') && !applicationId) {
        addMessage({
          sender: 'bot',
          text: 'Please create a loan application first before uploading documents.',
        });
      } else {
        addMessage({
          sender: 'bot',
          text: 'Please upload your documents using the paperclip icon 📎, then type "done" when ready.',
        });
      }
    }
    // Auto-approve after 2 seconds (simulation) - REMOVED, now using real AI verification
    else if (currentStage === 'underwriting') {
      addMessage({
        sender: 'bot',
        text: 'Your application is being reviewed. Please wait for the decision.',
      });
    }
    else if (currentStage === 'sanction') {
      addMessage({
        sender: 'bot',
        text: 'Your sanction letter is being generated. You can download it from the application details.',
      });
    }
    else if (currentStage === 'approved') {
      addMessage({
        sender: 'bot',
        text: 'Your loan has been approved! You can download your sanction letter or ask any questions about the loan terms.',
      });
    }
    // Default response
    else {
      addMessage({
        sender: 'bot',
        text: 'I\'m here to help with your loan application! How can I assist you today?',
      });
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStage('sales');
    setCollectingField('loanType'); // Reset to start
    setApplicationId(null);
    setApplicationData(null);
    setLoanDetails({
      fullName: '',
      email: '',
      phone: '',
      panCard: '',
      aadharNumber: '',
      loanType: '',
      requestedAmount: null,
      approvedAmount: null,
      interestRate: null,
      tenure: null,
      status: 'pending',
    });
    setUser({
      id: 'user_' + Date.now(),
      name: 'Guest User',
    });
    // Re-add welcome message
    setTimeout(() => {
      addMessage({
        sender: 'bot',
        text: 'Welcome to CrediFlow! 👋 I\'m here to help you with your loan application. Let\'s start by understanding your requirements. What type of loan are you looking for?',
        timestamp: new Date(),
      });
    }, 100);
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        messages,
        addMessage,
        sendMessage,
        currentStage,
        updateStage: setCurrentStage,
        loanDetails,
        setLoanDetails,
        isLoading,
        resetChat,
        applicationId,
        applicationMongoId,
        applicationData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
