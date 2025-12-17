#!/bin/bash

###########################################
# Quick Fix Script for Upload Issues
# Sistem Laboran DKV
###########################################

echo "🔧 Fixing Upload Issues..."
echo "================================"
echo ""

# Get current directory
APP_DIR=$(pwd)

# Check if we're in the right directory
if [ ! -d "public/uploads" ]; then
    echo "❌ Error: public/uploads folder not found"
    echo "   Please run this script from application root directory"
    echo "   Example: cd ~/public_html/laboran-dkv && bash scripts/fix-uploads.sh"
    exit 1
fi

echo "📁 Application directory: $APP_DIR"
echo ""

# Step 1: Fix permissions
echo "Step 1/5: Fixing folder permissions..."
chmod -R 755 public/uploads
if [ $? -eq 0 ]; then
    echo "✅ Permissions set to 755"
else
    echo "⚠️  Warning: Could not change permissions (may need sudo)"
fi
echo ""

# Step 2: Fix ownership
echo "Step 2/5: Fixing ownership..."
chown -R $USER:$USER public/uploads 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Ownership set to $USER"
else
    echo "⚠️  Warning: Could not change ownership (may need sudo or already correct)"
fi
echo ""

# Step 3: Create .htaccess
echo "Step 3/5: Creating .htaccess for Apache..."
cat > public/uploads/.htaccess << 'EOF'
# Allow access to uploaded files
<FilesMatch "\.(jpg|jpeg|png|gif|pdf|doc|docx)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Set MIME types
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType application/pdf .pdf
</IfModule>
EOF

if [ $? -eq 0 ]; then
    echo "✅ .htaccess created"
else
    echo "❌ Could not create .htaccess"
fi
echo ""

# Step 4: Verify files
echo "Step 4/5: Verifying uploaded files..."
FILE_COUNT=$(find public/uploads -type f | wc -l)
echo "📊 Found $FILE_COUNT uploaded files"

if [ $FILE_COUNT -gt 0 ]; then
    echo ""
    echo "Sample files:"
    find public/uploads -type f | head -3
fi
echo ""

# Step 5: Test access
echo "Step 5/5: Testing file access..."

# Find a sample file
SAMPLE_FILE=$(find public/uploads -type f \( -name "*.jpg" -o -name "*.png" \) | head -1)

if [ -n "$SAMPLE_FILE" ]; then
    # Extract relative path
    REL_PATH=${SAMPLE_FILE#public/}
    FOLDER=$(basename $(dirname "$SAMPLE_FILE"))
    FILENAME=$(basename "$SAMPLE_FILE")
    
    echo "Sample file: $SAMPLE_FILE"
    echo "Relative URL: /$REL_PATH"
    echo ""
    
    # Try to get domain from .env
    if [ -f ".env" ]; then
        DOMAIN=$(grep NEXT_PUBLIC_BASE_URL .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
        if [ -n "$DOMAIN" ]; then
            TEST_URL="$DOMAIN/$REL_PATH"
            echo "🌐 Test this URL in browser:"
            echo "   $TEST_URL"
            echo ""
            
            # Try curl if available
            if command -v curl &> /dev/null; then
                echo "Testing URL with curl..."
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null)
                
                if [ "$HTTP_CODE" = "200" ]; then
                    echo "✅ File is accessible! (HTTP 200)"
                elif [ "$HTTP_CODE" = "404" ]; then
                    echo "❌ File not found (HTTP 404)"
                    echo "   → Try Symlink solution (see troubleshooting guide)"
                elif [ "$HTTP_CODE" = "403" ]; then
                    echo "❌ Access forbidden (HTTP 403)"
                    echo "   → Check permissions and .htaccess"
                else
                    echo "⚠️  Got HTTP $HTTP_CODE"
                fi
            fi
        fi
    fi
else
    echo "⚠️  No image files found to test"
fi

echo ""
echo "================================"
echo "🎉 Quick fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your Node.js app via cPanel"
echo "2. Test file access via browser"
echo "3. If still not working, check: TROUBLESHOOTING-FILE-UPLOAD.md"
echo ""
echo "💡 Recommended solutions if files still not accessible:"
echo "   - Symlink: ln -s $APP_DIR/public/uploads ~/public_html/uploads"
echo "   - Or check cPanel Node.js App configuration"
echo ""
