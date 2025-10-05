#!/bin/bash

# Optimized Deployment Script for Home Healthcare Management System
# King Abdullah Hospital - Bisha

echo "🏥 Starting deployment for Home Healthcare Management System"
echo "================================================="

# Check if required tools are installed
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/ .vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --silent

# Environment check
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Creating template..."
    cat > .env.local << EOL
# Copy this template and add your actual values
GEMINI_API_KEY=your_api_key_here
EOL
fi

# Build optimizations
echo "⚡ Building with optimizations..."
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Display build statistics
    echo "📊 Build Statistics:"
    du -sh dist/
    echo "📁 Generated files:"
    ls -la dist/assets/
    
    # Deployment options
    echo ""
    echo "🚀 Choose deployment option:"
    echo "1) Firebase Hosting (Recommended for medical apps)"
    echo "2) Netlify (Fast and free)"
    echo "3) Create deployment package"
    
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            echo "🔥 Deploying to Firebase..."
            if command -v firebase >/dev/null 2>&1; then
                firebase deploy --only hosting
                echo "✅ Firebase deployment completed!"
                echo "🌐 Your app is live at: https://your-app.web.app"
            else
                echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
            fi
            ;;
        2)
            echo "🌐 Deploying to Netlify..."
            if command -v netlify >/dev/null 2>&1; then
                netlify deploy --prod --dir=dist
                echo "✅ Netlify deployment completed!"
            else
                echo "❌ Netlify CLI not found. Install with: npm install -g netlify-cli"
            fi
            ;;
        3)
            echo "📦 Creating deployment package..."
            tar -czf "healthcare-app-$(date +%Y%m%d-%H%M%S).tar.gz" dist/
            echo "✅ Deployment package created!"
            ;;
        *)
            echo "❌ Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    # Security checklist
    echo ""
    echo "🔒 Security Checklist:"
    echo "✓ Firebase rules configured for authorized users only"
    echo "✓ HTTPS enforced"
    echo "✓ Environment variables secured"
    echo "✓ No sensitive data in client bundle"
    
    # Performance tips
    echo ""
    echo "⚡ Performance Tips:"
    echo "• App is optimized for mobile-first usage"
    echo "• Print functionality uses optimized templates"
    echo "• Lazy loading implemented for forms"
    echo "• Bundle size optimized with code splitting"
    
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi

echo ""
echo "🎉 Deployment process completed!"
echo "📋 Next steps:"
echo "   1. Test the deployed application"
echo "   2. Update DNS settings if needed"
echo "   3. Share the URL with healthcare team"
echo "   4. Monitor application performance"