# Test Script - Check Database Connection and Create Sample Data

Write-Host "🧪 CrediFlow Database Test Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if server is running
Write-Host "Test 1: Checking if backend server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Status: $($healthCheck.status)" -ForegroundColor White
    Write-Host "   Environment: $($healthCheck.environment)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Backend server is not running!" -ForegroundColor Red
    Write-Host "   Please start it with: cd crediflow-server; npm run dev" -ForegroundColor Yellow
    exit
}

# Test 2: Create a test application
Write-Host "Test 2: Creating a test loan application..." -ForegroundColor Yellow
$testApplication = @{
    fullName = "Rishi Devrana"
    email = "[email protected]"
    phone = "9876543210"
    panCard = "ABCDE1234F"
    aadharNumber = "123456789012"
    loanType = "personal"
    loanAmount = 500000
    tenure = 36
    purpose = "Wedding expenses"
    employmentType = "salaried"
    monthlyIncome = 75000
    companyName = "Tech Corp India"
} | ConvertTo-Json

try {
    $createdApp = Invoke-RestMethod -Uri "http://localhost:5000/api/applications" -Method POST -Body $testApplication -ContentType "application/json"
    Write-Host "✅ Application created successfully!" -ForegroundColor Green
    Write-Host "   Application ID: $($createdApp.data.applicationId)" -ForegroundColor White
    Write-Host "   Name: $($createdApp.data.fullName)" -ForegroundColor White
    Write-Host "   Loan Amount: ₹$($createdApp.data.loanAmount)" -ForegroundColor White
    Write-Host "   Status: $($createdApp.data.status)" -ForegroundColor White
    Write-Host "   Stage: $($createdApp.data.stage)" -ForegroundColor White
    Write-Host ""
    
    $appId = $createdApp.data._id
} catch {
    Write-Host "❌ Failed to create application!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Test 3: Get all applications
Write-Host "Test 3: Fetching all applications from database..." -ForegroundColor Yellow
try {
    $allApps = Invoke-RestMethod -Uri "http://localhost:5000/api/applications" -Method GET
    Write-Host "✅ Successfully fetched applications!" -ForegroundColor Green
    Write-Host "   Total applications in database: $($allApps.data.Count)" -ForegroundColor White
    Write-Host ""
    
    if ($allApps.data.Count -gt 0) {
        Write-Host "   Recent Applications:" -ForegroundColor Cyan
        foreach ($app in $allApps.data | Select-Object -First 5) {
            Write-Host "   - $($app.applicationId) | $($app.fullName) | ₹$($app.loanAmount) | $($app.status)" -ForegroundColor White
        }
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to fetch applications!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Test 4: Get single application by ID
if ($appId) {
    Write-Host "Test 4: Fetching single application by ID..." -ForegroundColor Yellow
    try {
        $singleApp = Invoke-RestMethod -Uri "http://localhost:5000/api/applications/$appId" -Method GET
        Write-Host "✅ Successfully fetched application!" -ForegroundColor Green
        Write-Host "   Application ID: $($singleApp.data.applicationId)" -ForegroundColor White
        Write-Host "   Full Name: $($singleApp.data.fullName)" -ForegroundColor White
        Write-Host "   Email: $($singleApp.data.email)" -ForegroundColor White
        Write-Host "   Loan Type: $($singleApp.data.loanType)" -ForegroundColor White
        Write-Host "   Created: $($singleApp.data.createdAt)" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "❌ Failed to fetch application!" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 5: Create a user account
Write-Host "Test 5: Creating a test user account..." -ForegroundColor Yellow
$testUser = @{
    fullName = "Rishi Devrana"
    email = "[email protected]"
    phone = "9876543210"
    password = "Test@123"
} | ConvertTo-Json

try {
    $createdUser = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $testUser -ContentType "application/json"
    Write-Host "✅ User account created successfully!" -ForegroundColor Green
    Write-Host "   User ID: $($createdUser.data.user.id)" -ForegroundColor White
    Write-Host "   Email: $($createdUser.data.user.email)" -ForegroundColor White
    Write-Host "   Token: $($createdUser.data.token.Substring(0, 20))..." -ForegroundColor White
    Write-Host ""
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "ℹ️  User already exists (this is okay)" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "❌ Failed to create user!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Summary
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🎉 Database Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 How to view your data:" -ForegroundColor Cyan
Write-Host "1. MongoDB Atlas Web: https://cloud.mongodb.com/" -ForegroundColor White
Write-Host "2. MongoDB Compass: Download from https://www.mongodb.com/try/download/compass" -ForegroundColor White
Write-Host "3. VS Code Extension: Search 'MongoDB for VS Code'" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your connection string:" -ForegroundColor Cyan
Write-Host "mongodb+srv://rishidevrana2006_db_user:Rishi2006@cluster0.zefjtw0.mongodb.net/crediflow" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Database: crediflow" -ForegroundColor Cyan
Write-Host "📂 Collections: users, applications" -ForegroundColor White
Write-Host ""
