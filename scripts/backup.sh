#!/bin/bash

# Backup Script for Home Healthcare Management System
# King Abdullah Hospital - Bisha

echo "🏥 Healthcare System Backup Script"
echo "=================================="
echo ""

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="healthcare_backup_$TIMESTAMP"
MAX_BACKUPS=7  # Keep last 7 backups

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}📁 Creating backup: $BACKUP_NAME${NC}"
echo ""

# Create backup archive
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME.tar.gz"

echo "📦 Archiving application files..."
tar -czf "$BACKUP_PATH" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='.vite' \
    --exclude='*.log' \
    --exclude='.env.local' \
    . 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Application files archived"
else
    echo -e "${RED}✗${NC} Failed to archive application files"
    exit 1
fi

# Backup environment template (without sensitive data)
echo "🔧 Backing up environment template..."
if [ -f ".env.local.example" ]; then
    cp ".env.local.example" "$BACKUP_DIR/${BACKUP_NAME}_env_template"
    echo -e "${GREEN}✓${NC} Environment template backed up"
else
    echo -e "${YELLOW}⚠${NC} Environment template not found"
fi

# Backup Firebase configuration
echo "🔥 Backing up Firebase configuration..."
if [ -f "firebase.json" ]; then
    mkdir -p "$BACKUP_DIR/${BACKUP_NAME}_firebase"
    cp firebase.json "$BACKUP_DIR/${BACKUP_NAME}_firebase/"
    
    if [ -f "firestore.rules" ]; then
        cp firestore.rules "$BACKUP_DIR/${BACKUP_NAME}_firebase/"
    fi
    
    if [ -f "storage.rules" ]; then
        cp storage.rules "$BACKUP_DIR/${BACKUP_NAME}_firebase/"
    fi
    
    if [ -f "firestore.indexes.json" ]; then
        cp firestore.indexes.json "$BACKUP_DIR/${BACKUP_NAME}_firebase/"
    fi
    
    echo -e "${GREEN}✓${NC} Firebase configuration backed up"
else
    echo -e "${YELLOW}⚠${NC} Firebase configuration not found"
fi

# Backup database schema
echo "🗄️ Backing up database schema..."
if [ -d "database" ]; then
    cp -r database "$BACKUP_DIR/${BACKUP_NAME}_database"
    echo -e "${GREEN}✓${NC} Database schema backed up"
else
    echo -e "${YELLOW}⚠${NC} Database directory not found"
fi

# Backup deployment configurations
echo "🚀 Backing up deployment configurations..."
mkdir -p "$BACKUP_DIR/${BACKUP_NAME}_deploy"

if [ -f "netlify.toml" ]; then
    cp netlify.toml "$BACKUP_DIR/${BACKUP_NAME}_deploy/"
fi

if [ -f "Dockerfile" ]; then
    cp Dockerfile "$BACKUP_DIR/${BACKUP_NAME}_deploy/"
fi

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml "$BACKUP_DIR/${BACKUP_NAME}_deploy/"
fi

if [ -d "nginx" ]; then
    cp -r nginx "$BACKUP_DIR/${BACKUP_NAME}_deploy/"
fi

echo -e "${GREEN}✓${NC} Deployment configurations backed up"

# Export Firestore data (if Firebase CLI is available and logged in)
echo "☁️ Attempting to backup Firestore data..."
if command -v firebase &> /dev/null; then
    if firebase projects:list &> /dev/null; then
        echo "Exporting Firestore data..."
        firebase firestore:export "$BACKUP_DIR/${BACKUP_NAME}_firestore" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Firestore data exported"
        else
            echo -e "${YELLOW}⚠${NC} Firestore export failed (check permissions)"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Firebase CLI not logged in, skipping Firestore backup"
    fi
else
    echo -e "${YELLOW}⚠${NC} Firebase CLI not available, skipping Firestore backup"
fi

# Create backup metadata
echo "📋 Creating backup metadata..."
cat > "$BACKUP_DIR/${BACKUP_NAME}_metadata.json" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$TIMESTAMP",
  "date": "$(date -Iseconds)",
  "version": "$(grep -o '"version": "[^"]*' package.json | cut -d'"' -f4)",
  "node_version": "$(node --version 2>/dev/null || echo 'unknown')",
  "npm_version": "$(npm --version 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "backup_size": "$(du -sh "$BACKUP_PATH" | cut -f1)",
  "files_included": [
    "application_source",
    "firebase_configuration",
    "database_schema",
    "deployment_configs",
    "environment_template"
  ]
}
EOF

echo -e "${GREEN}✓${NC} Backup metadata created"

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
echo ""
echo -e "${GREEN}📊 Backup Summary${NC}"
echo "=================="
echo "• Backup name: $BACKUP_NAME"
echo "• Backup size: $BACKUP_SIZE"
echo "• Location: $BACKUP_PATH"
echo "• Timestamp: $(date)"

# Clean up old backups
echo ""
echo "🧹 Cleaning up old backups..."
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    BACKUPS_TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
    echo "Found $BACKUP_COUNT backups, removing $BACKUPS_TO_DELETE oldest..."
    
    ls -1t "$BACKUP_DIR"/*.tar.gz | tail -n "$BACKUPS_TO_DELETE" | while read backup_file; do
        echo "Removing old backup: $(basename "$backup_file")"
        rm "$backup_file"
        
        # Remove associated files
        backup_base=$(basename "$backup_file" .tar.gz)
        rm -rf "$BACKUP_DIR/${backup_base}_"*
    done
    
    echo -e "${GREEN}✓${NC} Old backups cleaned up"
else
    echo "Keeping all $BACKUP_COUNT backups (max: $MAX_BACKUPS)"
fi

echo ""
echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo ""
echo "📁 Backup files created:"
echo "   • $BACKUP_PATH (main backup)"
echo "   • $BACKUP_DIR/${BACKUP_NAME}_metadata.json (metadata)"
echo "   • $BACKUP_DIR/${BACKUP_NAME}_env_template (environment template)"
echo "   • $BACKUP_DIR/${BACKUP_NAME}_firebase/ (Firebase config)"
echo "   • $BACKUP_DIR/${BACKUP_NAME}_deploy/ (deployment configs)"

if [ -d "$BACKUP_DIR/${BACKUP_NAME}_firestore" ]; then
    echo "   • $BACKUP_DIR/${BACKUP_NAME}_firestore/ (Firestore data)"
fi

echo ""
echo "💡 Tips:"
echo "   • Store backups in a secure, off-site location"
echo "   • Test backup restoration regularly"
echo "   • Keep environment variables separate and secure"
echo "   • Document backup procedures for your team"

echo ""
echo -e "${BLUE}📋 To restore from this backup:${NC}"
echo "   1. Extract: tar -xzf $BACKUP_PATH"
echo "   2. Install dependencies: npm install"
echo "   3. Configure environment: cp .env.local.example .env.local"
echo "   4. Update .env.local with your values"
echo "   5. Deploy: ./deploy-optimized.sh"