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

  // Track conversation flow
  const [conversationStep, setConversationStep] = useState('initial'); // initial, loan_type_selection, eligibility, info, support

  // Track what information we're currently collecting
  const [collectingField, setCollectingField] = useState('menu'); // menu, loanType, name, email, phone, pan, aadhar, amount

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
        ? `Welcome back, ${welcomeName}! I'm your CrediFlow assistant.`
        : 'Hello! Welcome to CrediFlow - Your trusted financial partner.';
      
      addMessage({
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date(),
      });

      // Add options after welcome message
      setTimeout(() => {
        addMessage({
          sender: 'bot',
          text: 'I\'m here to guide you through your loan journey. What would you like to explore today?',
          timestamp: new Date(),
          options: [
            { text: 'Start New Loan Application', value: 'apply' },
            { text: 'Check Eligibility Requirements', value: 'eligibility' },
            { text: 'Compare Loan Products', value: 'info' },
            { text: 'Connect with Support', value: 'support' }
          ]
        });
      }, 500);
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
      
      // Main menu options
      if (collectingField === 'menu') {
        // Option 1: Apply for a New Loan
        if (lowerMessage.includes('apply')) {
          setCollectingField('loanType');
          setConversationStep('loan_type_selection');
          addMessage({
            sender: 'bot',
            text: 'Excellent! Let\'s find the perfect loan solution for you. Each product is designed with competitive rates and flexible terms.',
            options: [
              { text: 'Home Loan - Property Purchase or Renovation', value: 'home' },
              { text: 'Business Loan - Capital for Growth', value: 'business' },
              { text: 'Personal Loan - Flexible Financing', value: 'personal' }
            ]
          });
        }
        // Option 2: Check Eligibility
        else if (lowerMessage.includes('eligibility')) {
          setConversationStep('eligibility');
          addMessage({
            sender: 'bot',
            text: '**Basic Eligibility Requirements:**\n\n• Age Range: 21 to 65 years\n• Minimum Monthly Income: ₹25,000\n• Credit Score: 650 or above (recommended)\n• Employment Status: Salaried or Self-employed\n• Documentation: Valid PAN, Aadhar, and income proof\n\n*Meeting these criteria increases your approval chances significantly.*',
            options: [
              { text: 'I qualify - Start application', value: 'apply' },
              { text: 'View detailed product info', value: 'info' },
              { text: 'Return to main options', value: 'menu' }
            ]
          });
        }
        // Option 3: Learn About Products
        else if (lowerMessage.includes('info')) {
          setConversationStep('info');
          addMessage({
            sender: 'bot',
            text: '**Comprehensive Loan Solutions:**\n\n**Home Loan**\n→ Interest Rate: Starting 8.5% p.a.\n→ Maximum Amount: Up to ₹5 Crore\n→ Repayment Period: Up to 30 years\n→ Special Feature: Tax benefits under 80C & 24(b)\n\n**Business Loan**\n→ Interest Rate: Starting 11% p.a.\n→ Maximum Amount: Up to ₹50 Lakhs\n→ Repayment Period: Up to 5 years\n→ Special Feature: No collateral needed for loans under ₹10L\n\n**Personal Loan**\n→ Interest Rate: Starting 10.5% p.a.\n→ Maximum Amount: Up to ₹25 Lakhs\n→ Repayment Period: Up to 7 years\n→ Special Feature: Instant approval for eligible applicants',
            options: [
              { text: 'Begin application process', value: 'apply' },
              { text: 'Verify my eligibility', value: 'eligibility' },
              { text: 'Speak with loan advisor', value: 'support' }
            ]
          });
        }
        // Option 4: Support
        else if (lowerMessage.includes('support')) {
          setConversationStep('support');
          addMessage({
            sender: 'bot',
            text: '**Customer Support Channels:**\n\nOur dedicated team is ready to assist you:\n\n• Helpline: 1800-XXX-XXXX (Toll-free)\n• Email: support@crediflow.com\n• Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM\n\nFor immediate loan assistance, you can start your application right here.',
            options: [
              { text: 'Start loan application', value: 'apply' },
              { text: 'Return to main menu', value: 'menu' }
            ]
          });
        }
        // Show main menu again
        else if (lowerMessage.includes('menu')) {
          addMessage({
            sender: 'bot',
            text: 'What would you like to do next?',
            options: [
              { text: 'Start New Loan Application', value: 'apply' },
              { text: 'Check Eligibility Requirements', value: 'eligibility' },
              { text: 'Compare Loan Products', value: 'info' },
              { text: 'Connect with Support', value: 'support' }
            ]
          });
        }
        else {
          addMessage({
            sender: 'bot',
            text: 'I didn\'t quite understand that. Please select one of these options:',
            options: [
              { text: 'Start New Loan Application', value: 'apply' },
              { text: 'Check Eligibility Requirements', value: 'eligibility' },
              { text: 'Compare Loan Products', value: 'info' },
              { text: 'Connect with Support', value: 'support' }
            ]
          });
        }
      }
      
      // Collect loan type
      else if (collectingField === 'loanType') {
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
              text: `Excellent choice, ${authUser.fullName}! Personal loans offer maximum flexibility for various financial needs.\n\n**Key Features:**\n→ Interest Rate: 10.5% - 15% per annum\n→ Loan Amount: ₹50,000 to ₹25 Lakhs\n→ Tenure Options: 12 to 84 months\n→ Common Uses: Medical expenses, education, weddings, debt consolidation\n\nLet's proceed with your application. Please provide your PAN card number:`,
            });
          } else {
            setLoanDetails(prev => ({ ...prev, loanType: 'personal' }));
            setCollectingField('name');
            addMessage({
              sender: 'bot',
              text: 'Personal Loan selected - an excellent choice for flexible financing.\n\n**Benefits:**\n→ Quick approval within 24-48 hours\n→ Minimal documentation required\n→ Flexible repayment schedules\n→ No collateral needed\n\nTo get started, please provide your full name:',
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
              text: `Perfect choice, ${authUser.fullName}! You're taking a significant step toward property ownership.\n\n**Home Loan Advantages:**\n→ Competitive rates starting at 8.5% per annum\n→ Loan amount up to ₹5 Crore\n→ Repayment tenure up to 30 years\n→ Tax benefits under Section 80C & Section 24(b)\n→ Property title verification included\n\nLet's begin your application. Please provide your PAN card number:`,
            });
          } else {
            setLoanDetails(prev => ({ ...prev, loanType: 'home' }));
            setCollectingField('name');
            addMessage({
              sender: 'bot',
              text: 'Home Loan selected - investing in property is always a smart decision.\n\n**Why Choose Our Home Loan:**\n→ Market-leading interest rates\n→ Streamlined documentation process\n→ Rapid loan disbursal\n→ Dedicated property advisor support\n\nTo begin, please provide your full name:',
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
              text: `Great decision, ${authUser.fullName}! Business loans are designed to fuel entrepreneurial growth.\n\n**Business Loan Details:**\n→ Interest rates starting from 11% per annum\n→ Funding up to ₹50 Lakhs\n→ Flexible tenure: 12 to 60 months\n→ No collateral required for loans under ₹10 Lakhs\n\n**Ideal For:**\n→ Working capital requirements\n→ Business expansion initiatives\n→ Equipment and machinery purchase\n→ Inventory management\n\nLet's start your application. Please provide your PAN card number:`,
            });
          } else {
            setLoanDetails(prev => ({ ...prev, loanType: 'business' }));
            setCollectingField('name');
            addMessage({
              sender: 'bot',
              text: 'Business Loan selected - fueling growth through strategic financing.\n\n**What We Offer:**\n→ Fast approval within 48 hours\n→ Competitive interest rates\n→ Tailored repayment solutions\n→ Dedicated business relationship manager\n\nTo proceed, please provide your full name:',
            });
          }
        } else {
          addMessage({
            sender: 'bot',
            text: 'Please select one of our loan products:\n\n**Home Loan** - Property purchase or renovation\n**Business Loan** - Capital for business growth\n**Personal Loan** - Flexible personal financing\n\nType "Home", "Business", or "Personal" to continue.',
          });
        }
      }
      // Collect name (only if not authenticated)
      else if (collectingField === 'name' && text.length > 2 && !lowerMessage.match(/\d/)) {
        setLoanDetails(prev => ({ ...prev, fullName: text }));
        setCollectingField('email');
        addMessage({
          sender: 'bot',
          text: `Thank you, ${text}. It's a pleasure to assist you.\n\nPlease provide your email address for application updates and communications:`,
        });
      }
      // Collect email (only if not authenticated)
      else if (collectingField === 'email' && text.includes('@')) {
        setLoanDetails(prev => ({ ...prev, email: text }));
        setCollectingField('phone');
        addMessage({
          sender: 'bot',
          text: 'Email address confirmed.\n\nNow, please provide your mobile number (10 digits):',
        });
      }
      // Collect phone (only if not authenticated)
      else if (collectingField === 'phone' && lowerMessage.match(/^\d{10}$/)) {
        setLoanDetails(prev => ({ ...prev, phone: text }));
        setCollectingField('pan');
        addMessage({
          sender: 'bot',
          text: 'Mobile number recorded.\n\nFor identity verification, please provide your PAN card number.\n(Format: ABCDE1234F)',
        });
      }
      // Collect PAN
      else if (collectingField === 'pan' && text.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/i)) {
        setLoanDetails(prev => ({ ...prev, panCard: text.toUpperCase() }));
        setCollectingField('aadhar');
        addMessage({
          sender: 'bot',
          text: 'PAN card verified successfully.\n\nNext, please provide your Aadhar number for KYC compliance.\n(12-digit number)',
        });
      }
      // Collect Aadhar
      else if (collectingField === 'aadhar' && lowerMessage.match(/^\d{12}$/)) {
        setLoanDetails(prev => ({ ...prev, aadharNumber: text }));
        setCollectingField('amount');
        addMessage({
          sender: 'bot',
          text: 'Identity documents verified successfully.\n\nNow, please specify the loan amount you require:\n(Enter numerical value, e.g., 500000 for ₹5 Lakhs)',
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
