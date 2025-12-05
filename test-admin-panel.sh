#!/bin/bash
# Complete Admin Panel Test Script

echo "🧪 Admin Panel Complete System Test"
echo "===================================="
echo ""

# Test 1: Backend Running
echo "1️⃣ Testing Backend (Port 5001)..."
if curl -s http://localhost:5001/api/news > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 5001"
else
    echo "   ❌ Backend not responding on port 5001"
    echo "   💡 Run: cd backend && npm run dev"
    exit 1
fi

# Test 2: Frontend Running
echo ""
echo "2️⃣ Testing Frontend (Port 5173)..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 5173"
else
    echo "   ❌ Frontend not responding on port 5173"
    echo "   💡 Run: cd frontend/admin && npm run dev"
    exit 1
fi

# Test 3: Completed Posts Endpoint
echo ""
echo "3️⃣ Testing Completed Posts API..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/admin/completed-posts)
if [ "$RESPONSE" == "401" ]; then
    echo "   ✅ API endpoint exists (401 = needs auth, which is correct)"
elif [ "$RESPONSE" == "200" ]; then
    echo "   ✅ API endpoint working perfectly"
else
    echo "   ⚠️  Unexpected response: $RESPONSE"
fi

# Test 4: Check Database
echo ""
echo "4️⃣ Checking Database for Completed Posts..."
cd backend
node check-completed-posts.js 2>&1 | grep -A 2 "Found.*completed posts"

echo ""
echo "===================================="
echo "✅ SYSTEM CHECK COMPLETE!"
echo "===================================="
echo ""
echo "📋 Access Points:"
echo "   Admin Login: http://localhost:5173/admin/login"
echo "   News Dashboard: http://localhost:5173/admin/news-dashboard"
echo "   Main Dashboard: http://localhost:5173/admin/dashboard"
echo ""
echo "🔑 Central Admin Login:"
echo "   Email: nikhilsethin494@gmail.com"
echo "   Password: (your password)"
echo ""
echo "💡 If you see errors in the admin panel:"
echo "   1. Hard refresh browser (Ctrl+Shift+R)"
echo "   2. Logout and login again"
echo "   3. Check browser console (F12) for errors"
echo "   4. See ADMIN_PANEL_STATUS.md for detailed troubleshooting"
echo ""
