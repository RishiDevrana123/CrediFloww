import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { applicationAPI } from '../services/api';
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

  // Track if welcome message has been added
  const welcomeAddedRef = useRef(false);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && !welcomeAddedRef.current) {
      welcomeAddedRef.current = true;
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
            text: `Perfect! Your application ${newApplication.data.applicationId} has been created for ₹${amount}. Now let's move to verification. Please upload your PAN card, Aadhar, and salary slips.`,
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
          formData.append('type', 'other');

          await applicationAPI.uploadDocument(applicationData._id, formData);
          
          addMessage({
            sender: 'bot',
            text: `Thank you! ${file.name} uploaded successfully. Upload more documents or type "done" to proceed.`,
          });
        } catch (error) {
          console.error('Error uploading document:', error);
          addMessage({
            sender: 'bot',
            text: 'Sorry, there was an error uploading your document. Please try again.',
          });
        }
      } else if (lowerMessage.includes('done') && applicationId) {
        // Move to underwriting
        try {
          await applicationAPI.updateStage(applicationData._id, 'underwriting');
          
          addMessage({
            sender: 'bot',
            text: 'Excellent! Your documents are verified. Moving to underwriting...',
          });
          setCurrentStage('underwriting');
          
          // Auto-approve after 2 seconds (simulation)
          setTimeout(async () => {
            try {
              await applicationAPI.updateStage(applicationData._id, 'sanction');
              
              addMessage({
                sender: 'bot',
                text: 'Great news! Underwriting complete. Moving to final sanction...',
              });
              setCurrentStage('sanction');
              
              // Approve the loan
              setTimeout(async () => {
                const approved = await applicationAPI.approve(applicationData._id, {
                  approvedAmount: loanDetails.requestedAmount,
                  interestRate: 10.99,
                  approvedTenure: 36,
                });
                
                setLoanDetails(prev => ({
                  ...prev,
                  approvedAmount: approved.data.approvedAmount,
                  interestRate: approved.data.interestRate,
                  tenure: approved.data.approvedTenure,
                  status: 'approved',
                }));
                
                addMessage({
                  sender: 'bot',
                  text: `🎉 Congratulations! Your loan has been APPROVED!\n\nApplication ID: ${applicationId}\nApproved Amount: ₹${approved.data.approvedAmount}\nInterest Rate: ${approved.data.interestRate}% p.a.\nTenure: ${approved.data.approvedTenure} months\nEMI: ₹${approved.data.emi}\n\nYour loan will be disbursed within 2 business days!`,
                });
                setCurrentStage('completed');
              }, 2000);
            } catch (error) {
              console.error('Error in approval:', error);
            }
          }, 2000);
        } catch (error) {
          console.error('Error updating stage:', error);
        }
      } else {
        addMessage({
          sender: 'bot',
          text: 'Please upload documents or type "done" to continue.',
        });
      }
    }
    // Other stages
    else {
      addMessage({
        sender: 'bot',
        text: 'Your application is being processed. Thank you for your patience!',
      });
    }
  };

  // Update loan stage manually (for testing)
  const updateStage = (stage) => {
    setCurrentStage(stage);
  };

  // Reset chat
  const resetChat = () => {
    setMessages([]);
    setCurrentStage('sales');
    setCollectingField('loanType'); // Reset to start
    setApplicationId(null);
    setApplicationMongoId(null);
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
    // Reset welcome message ref and re-add welcome message
    welcomeAddedRef.current = false;
    setTimeout(() => {
      if (!welcomeAddedRef.current) {
        welcomeAddedRef.current = true;
        addMessage({
          sender: 'bot',
          text: 'Welcome to CrediFlow! 👋 I\'m here to help you with your loan application. Let\'s start by understanding your requirements. What type of loan are you looking for?',
          timestamp: new Date(),
        });
      }
    }, 100);
  };

  const value = {
    user,
    setUser,
    messages,
    addMessage,
    sendMessage,
    currentStage,
    updateStage,
    loanDetails,
    setLoanDetails,
    isLoading,
    resetChat,
    applicationId,
    applicationMongoId,
    applicationData,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
