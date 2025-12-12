// Quick test script to insert data into MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Application Schema (simplified)
const applicationSchema = new mongoose.Schema({
  applicationId: String,
  fullName: String,
  email: String,
  phone: String,
  panCard: String,
  aadharNumber: String,
  loanType: String,
  loanAmount: Number,
  tenure: Number,
  status: { type: String, default: 'draft' },
  stage: { type: String, default: 'sales' },
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

// Test function
async function testDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected!');

    // Create test application
    console.log('\n📝 Creating test application...');
    const testApp = await Application.create({
      applicationId: `CF${Date.now()}`,
      fullName: 'Rishi Dev Rana',
      email: '[email protected]',
      phone: '9876543210',
      panCard: 'ABCDE1234F',
      aadharNumber: '123456789012',
      loanType: 'personal',
      loanAmount: 500000,
      tenure: 36,
    });

    console.log('✅ Application created successfully!');
    console.log('\n📄 Application Details:');
    console.log(JSON.stringify(testApp, null, 2));

    // Count total applications
    const count = await Application.countDocuments();
    console.log(`\n📊 Total applications in database: ${count}`);

    // Retrieve all applications
    console.log('\n📋 All Applications:');
    const allApps = await Application.find().limit(5);
    allApps.forEach((app, index) => {
      console.log(`\n${index + 1}. ${app.fullName} - ${app.applicationId}`);
      console.log(`   Loan: ₹${app.loanAmount} (${app.loanType})`);
      console.log(`   Status: ${app.status} | Stage: ${app.stage}`);
    });

    console.log('\n✅ Database test completed successfully!');
    console.log('🔍 Now refresh your MongoDB Atlas browser to see the data!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run test
testDatabase();
