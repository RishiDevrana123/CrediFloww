import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Personal Information
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    panCard: {
      type: String,
      required: [true, 'PAN card is required'],
      uppercase: true,
      trim: true,
    },
    aadharNumber: {
      type: String,
      required: [true, 'Aadhar number is required'],
      trim: true,
    },
    // Loan Details
    loanType: {
      type: String,
      enum: ['personal', 'home', 'business', 'car', 'education', 'property'],
      required: [true, 'Loan type is required'],
    },
    loanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [10000, 'Minimum loan amount is ₹10,000'],
      max: [10000000, 'Maximum loan amount is ₹1,00,00,000'],
    },
    tenure: {
      type: Number,
      required: [true, 'Loan tenure is required'],
      min: [6, 'Minimum tenure is 6 months'],
      max: [360, 'Maximum tenure is 360 months'],
    },
    purpose: {
      type: String,
      trim: true,
    },
    // Employment & Income
    employmentType: {
      type: String,
      enum: ['salaried', 'self-employed', 'business', 'professional'],
    },
    monthlyIncome: {
      type: Number,
      min: 0,
    },
    companyName: {
      type: String,
      trim: true,
    },
    // Documents
    documents: [
      {
        type: {
          type: String,
          enum: ['pan', 'aadhar', 'salary-slip', 'bank-statement', 'other'],
        },
        filename: String,
        path: String,
        verificationStatus: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Application Status
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under-review', 'verified', 'approved', 'rejected', 'disbursed'],
      default: 'draft',
    },
    stage: {
      type: String,
      enum: ['sales', 'verification', 'underwriting', 'sanction', 'completed'],
      default: 'sales',
    },
    // Verification & Approval
    creditScore: {
      type: Number,
      min: 300,
      max: 900,
    },
    interestRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    emi: {
      type: Number,
      min: 0,
    },
    approvedAmount: {
      type: Number,
      min: 0,
    },
    approvedTenure: {
      type: Number,
      min: 0,
    },
    rejectionReason: {
      type: String,
    },
    // Timestamps for stages
    salesCompletedAt: Date,
    verificationCompletedAt: Date,
    underwritingCompletedAt: Date,
    sanctionCompletedAt: Date,
    // Chat History
    chatHistory: [
      {
        sender: {
          type: String,
          enum: ['bot', 'user'],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Notes & Comments
    notes: [
      {
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate unique application ID
applicationSchema.pre('save', async function (next) {
  if (!this.applicationId) {
    const prefix = 'CF';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.applicationId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Calculate EMI
applicationSchema.methods.calculateEMI = function () {
  const principal = this.approvedAmount || this.loanAmount;
  const rate = (this.interestRate || 10) / 12 / 100;
  const tenure = this.approvedTenure || this.tenure;

  const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
  return Math.round(emi);
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;
