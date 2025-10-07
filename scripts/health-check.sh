#!/bin/bash

# Health Check Script for Home Healthcare Management System
# King Abdullah Hospital - Bisha

echo "🏥 Healthcare System Health Check"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for failed checks
FAILED_CHECKS=0

# Function to check if command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to check URL response
check_url() {
    local url=$1
    local expected_code=${2:-200}
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        if [ "$response" = "$expected_code" ]; then
            echo -e "${GREEN}✓${NC} $url responds with $response"
            return 0
        else
            echo -e "${RED}✗${NC} $url responds with $response (expected $expected_code)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
    else
        echo -e "${YELLOW}⚠${NC} curl not available, skipping URL check for $url"
        return 0
    fi
}

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Function to check directory exists
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 directory exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 directory not found"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

echo "🔧 Checking System Requirements..."
echo "--------------------------------"

# Check Node.js
if check_command "node"; then
    node_version=$(node --version)
    echo "   Version: $node_version"
    
    # Check if Node.js version is 18+
    major_version=$(echo $node_version | cut -d'.' -f1 | sed 's/v//')
    if [ "$major_version" -ge 18 ]; then
        echo -e "   ${GREEN}✓${NC} Node.js version is compatible"
    else
        echo -e "   ${RED}✗${NC} Node.js version should be 18 or higher"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# Check npm
if check_command "npm"; then
    npm_version=$(npm --version)
    echo "   Version: $npm_version"
fi

echo ""
echo "📁 Checking Project Files..."
echo "----------------------------"

# Check essential files
check_file "package.json"
check_file "vite.config.ts"
check_file "index.html"
check_file ".env.local"

# Check essential directories
check_directory "components"
check_directory "context"
check_directory "utils"

echo ""
echo "🔥 Checking Firebase Configuration..."
echo "-----------------------------------"

# Check Firebase CLI
if check_command "firebase"; then
    firebase_version=$(firebase --version)
    echo "   Version: $firebase_version"
    
    # Check if logged in to Firebase
    if firebase projects:list &> /dev/null; then
        echo -e "${GREEN}✓${NC} Firebase CLI is logged in"
        
        # Check current project
        current_project=$(firebase use --quiet 2>/dev/null)
        if [ "$current_project" = "studio-2008079270-29431" ]; then
            echo -e "${GREEN}✓${NC} Correct Firebase project selected"
        else
            echo -e "${YELLOW}⚠${NC} Current project: $current_project (expected: studio-2008079270-29431)"
        fi
    else
        echo -e "${RED}✗${NC} Firebase CLI not logged in"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# Check Firebase configuration files
check_file "firebase.json"
check_file "firestore.rules"
check_file "storage.rules"

echo ""
echo "🌐 Checking Netlify Configuration..."
echo "----------------------------------"

# Check Netlify CLI
if check_command "netlify"; then
    netlify_version=$(netlify --version)
    echo "   Version: $netlify_version"
fi

# Check Netlify configuration
check_file "netlify.toml"

echo ""
echo "📦 Checking Dependencies..."
echo "-------------------------"

if [ -f "package.json" ] && check_command "npm"; then
    echo "Checking if dependencies are installed..."
    
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓${NC} node_modules directory exists"
        
        # Check for critical dependencies
        if [ -d "node_modules/react" ]; then
            echo -e "${GREEN}✓${NC} React is installed"
        else
            echo -e "${RED}✗${NC} React not found in node_modules"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
        
        if [ -d "node_modules/vite" ]; then
            echo -e "${GREEN}✓${NC} Vite is installed"
        else
            echo -e "${RED}✗${NC} Vite not found in node_modules"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
    else
        echo -e "${RED}✗${NC} node_modules directory not found - run 'npm install'"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

echo ""
echo "⚙️ Checking Environment Configuration..."
echo "--------------------------------------"

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local file exists"
    
    # Check for critical environment variables
    if grep -q "GEMINI_API_KEY" .env.local; then
        if grep -q "GEMINI_API_KEY=your_actual" .env.local; then
            echo -e "${YELLOW}⚠${NC} GEMINI_API_KEY is set to placeholder value"
        else
            echo -e "${GREEN}✓${NC} GEMINI_API_KEY is configured"
        fi
    else
        echo -e "${YELLOW}⚠${NC} GEMINI_API_KEY not found in .env.local"
    fi
    
    if grep -q "DATABASE_URL" .env.local; then
        echo -e "${GREEN}✓${NC} DATABASE_URL is configured"
    else
        echo -e "${YELLOW}⚠${NC} DATABASE_URL not found in .env.local"
    fi
else
    echo -e "${RED}✗${NC} .env.local file not found"
    echo "   Create one by copying .env.local.example"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo ""
echo "🏗️ Checking Build System..."
echo "--------------------------"

# Try to build the project
echo "Testing build process..."
if npm run build &> /dev/null; then
    echo -e "${GREEN}✓${NC} Build process completed successfully"
    
    # Check if dist directory was created
    if [ -d "dist" ]; then
        echo -e "${GREEN}✓${NC} dist directory created"
        
        # Check for essential build files
        if [ -f "dist/index.html" ]; then
            echo -e "${GREEN}✓${NC} index.html generated"
        else
            echo -e "${RED}✗${NC} index.html not found in dist"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
        
        # Check bundle size
        if [ -d "dist/assets" ]; then
            bundle_size=$(du -sh dist/assets 2>/dev/null | cut -f1)
            echo "   Bundle size: $bundle_size"
        fi
    else
        echo -e "${RED}✗${NC} dist directory not created"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
else
    echo -e "${RED}✗${NC} Build process failed"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo ""
echo "🌍 Checking Network Connectivity..."
echo "----------------------------------"

# Check internet connectivity
check_url "https://google.com" "200"

# Check Firebase services
check_url "https://firebase.googleapis.com" "200"

# Check Netlify
check_url "https://netlify.com" "200"

echo ""
echo "📊 Health Check Summary"
echo "======================"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! System is healthy.${NC}"
    echo ""
    echo "✅ Ready for deployment!"
    exit 0
else
    echo -e "${RED}⚠️  $FAILED_CHECKS check(s) failed.${NC}"
    echo ""
    echo "❌ Please fix the issues above before deployment."
    echo ""
    echo "🔧 Common fixes:"
    echo "   • Run 'npm install' to install dependencies"
    echo "   • Create .env.local from .env.local.example"
    echo "   • Run 'firebase login' to authenticate"
    echo "   • Check your internet connection"
    echo ""
    exit 1
fi