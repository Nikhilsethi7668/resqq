# Email & Alert Issues - Quick Fix Guide

## Issue 1: Not Receiving Emails ❌

**Problem:** Backend server hasn't reloaded the new email template code.

**Solution:**
```bash
# In your backend terminal:
1. Press Ctrl+C to stop the server
2. Run: npm run dev
```

The server will restart with the new email template code loaded.

---

## Issue 2: Red Alert Blinking Only Shows for State Admin ❌

**Problem:** Central admins are not seeing the red blinking alert screen when high-danger SOS reports are created.

**Root Cause:** The socket.io room joining logic is working correctly, but we need to verify the emission is reaching central_admin room.

### Current Socket Logic (Backend)

In `postController.js` (lines 152-156):
```javascript
io.to('central_admin').emit('new_alert', alertPayload);
io.to(`state_${state}`).emit('new_alert', alertPayload);
io.to(`city_${city}`).emit('new_alert', alertPayload);
```

This SHOULD work for central admins. The issue might be:

1. **Central admin not joining the room properly**
2. **Socket connection not established**
3. **Frontend not listening correctly**

---

## Debugging Steps

### Step 1: Check Backend Logs

When you create a high-danger SOS, you should see in backend terminal:
```
Socket 12345 joined central_admin
```

If you DON'T see this, the central admin isn't joining the room.

### Step 2: Check Frontend Console

Open browser console (F12) when logged in as central admin. You should see:
```
Socket connected
```

### Step 3: Test Socket Connection

1. Login as **central admin**
2. Open browser console (F12)
3. Look for "Socket connected" message
4. Create a high-danger SOS from user frontend
5. Check if "New Alert Received:" appears in console

---

## Quick Test

### Test 1: Verify Central Admin Receives Socket Events

1. Login to admin panel as **central admin**
2. Open browser console (F12)
3. Paste this code:
```javascript
console.log('Testing socket connection...');
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

You should see your user object with `role: "central_admin"`.

### Test 2: Create High-Danger SOS

1. Go to user frontend: `http://localhost:5174`
2. Login as a user
3. Create SOS with:
   - **Content**: "FIRE! URGENT! HELP NEEDED!"
   - **City**: Any city
   - **State**: Any state
4. Submit

**Expected Results:**
- ✅ Backend logs show: "Socket emitting to central_admin"
- ✅ Central admin sees red blinking screen
- ✅ Central admin receives email at nikhilsethin494@gmail.com

---

## If Central Admin Still Doesn't See Alerts

### Check 1: Verify User Role

In MongoDB or via API, check that your central admin account has:
```javascript
{
  email: "nikhilsethin494@gmail.com",
  role: "central_admin",  // Must be exactly this
  isActive: true
}
```

### Check 2: Clear Browser Cache

Sometimes the frontend caches old code:
1. In admin panel, press `Ctrl+Shift+R` (hard refresh)
2. Or clear browser cache
3. Re-login

### Check 3: Check Socket URL

In `frontend/admin/src/stores/useSocketStore.js`, verify:
```javascript
const SOCKET_URL = 'http://localhost:5001';  // Should match backend port
```

And in `frontend/admin/src/services/socket.js` (if it exists).

---

## Common Issues & Fixes

### Issue: "Socket not defined" error
**Fix:** Make sure socket.io-client is installed:
```bash
cd frontend/admin
npm install socket.io-client
```

### Issue: CORS error in console
**Fix:** Backend `.env` should have:
```env
ADMIN_ORIGIN=http://localhost:5173
```

### Issue: Alert shows for state admin but not central admin
**Fix:** This suggests the socket room joining is working for state admins but not central admins. Check the `join_room` emission in Layout.jsx.

---

## Verification Checklist

After restarting backend:

- [ ] Backend server running on port 5000 or 5001
- [ ] Frontend admin running on port 5173
- [ ] Central admin logged in
- [ ] Browser console shows "Socket connected"
- [ ] Backend logs show "Socket [id] joined central_admin"
- [ ] Create high-danger SOS (danger > 50)
- [ ] Central admin sees red blinking screen
- [ ] Central admin receives email

---

## Next Steps

1. **Restart backend server** (Ctrl+C, then `npm run dev`)
2. **Hard refresh admin frontend** (Ctrl+Shift+R)
3. **Login as central admin**
4. **Check browser console** for socket connection
5. **Create test SOS** with high danger keywords
6. **Verify alert appears** on central admin screen
7. **Check email** at nikhilsethin494@gmail.com

If issues persist, check the backend logs for any socket-related errors!
