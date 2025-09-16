#!/bin/bash
# Koyeb Deploy Helper Script

echo "🚀 KOYEB DEPLOY PREPARATION"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "go.mod" ]; then
    echo "❌ Please run this script from the analyzer root directory"
    exit 1
fi

echo "📦 Preparing for Koyeb deployment..."

# Build locally to verify everything works
echo "1️⃣ Testing local build..."
make build-dev linux amd64

if [ $? -eq 0 ]; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed"
    exit 1
fi

# Test the binary quickly
echo "2️⃣ Testing binary..."
./dist/analyzer_linux_amd64 --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Binary works"
else
    echo "❌ Binary test failed"
    exit 1
fi

echo
echo "3️⃣ Koyeb deployment instructions:"
echo "=================================="
echo
echo "🔧 Setup steps:"
echo "   1. Go to https://app.koyeb.com/"
echo "   2. Create new service"
echo "   3. Choose 'GitHub' as source"
echo "   4. Select this repository: faelmori/analyzer"
echo "   5. Branch: rocket-in-a-pocket"
echo "   6. Docker configuration:"
echo "      - Dockerfile: Dockerfile.koyeb"
echo "      - Port: 8080"
echo
echo "🔑 Environment variables to set in Koyeb:"
echo "   - GEMINI_API_KEY=your_gemini_key"
echo "   - OPENAI_API_KEY=your_openai_key (optional)"
echo "   - ANTHROPIC_API_KEY=your_anthropic_key (optional)"
echo "   - CONFIG_FILE=./config/koyeb.yml"
echo
echo "🌐 Service configuration:"
echo "   - Service name: analyzer-gateway"
echo "   - Region: Frankfurt (EU) or Washington (US)"
echo "   - Instance type: Nano (should be enough for start)"
echo "   - Auto-deploy: ON"
echo
echo "📋 Health check endpoint:"
echo "   - Path: /healthz"
echo "   - Port: 8080"
echo "   - Initial delay: 30s"
echo
echo "🔗 After deployment:"
echo "   - Note the Koyeb URL (e.g., https://analyzer-gateway-faelmori.koyeb.app)"
echo "   - Update frontend GATEWAY_URL to point to Koyeb"
echo "   - Test endpoints:"
echo "     - GET {koyeb_url}/healthz"
echo "     - GET {koyeb_url}/v1/providers"
echo "     - POST {koyeb_url}/v1/chat"

echo
echo "🧪 Quick test commands after deploy:"
echo "====================================="
echo "# Replace YOUR_KOYEB_URL with actual URL"
echo "KOYEB_URL=\"https://analyzer-gateway-faelmori.koyeb.app\""
echo
echo "# Test health"
echo "curl \$KOYEB_URL/healthz"
echo
echo "# Test providers"
echo "curl \$KOYEB_URL/v1/providers"
echo
echo "# Test chat (with your Gemini key)"
echo "curl -X POST \$KOYEB_URL/v1/chat \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"X-External-API-Key: YOUR_GEMINI_KEY\" \\"
echo "  -d '{\"provider\":\"gemini\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello!\"}]}'"

echo
echo "🎯 Frontend integration:"
echo "========================"
echo "Update frontend environment:"
echo "   - GATEWAY_URL=https://your-koyeb-url.koyeb.app"
echo "   - Redeploy frontend to Vercel"
echo "   - Test full flow: Frontend → Koyeb → AI Provider"

echo
echo "🚀 Ready for Koyeb! Deploy when ready!"
echo "💡 Tip: Start with just Gemini API key, add others later"
