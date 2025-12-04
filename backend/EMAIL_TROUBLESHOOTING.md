# Email Configuration Guide for ResQQ

## Issue: Not Receiving Email Alerts

If you're not receiving email alerts when high-danger SOS reports are created, follow this guide to diagnose and fix the issue.

---

## Quick Diagnosis

### Step 1: Check Backend Logs

When a high-danger SOS is created (danger score > 50), you should see these logs in your backend terminal:

```
📧 Attempting to send email...
   To: [ 'nikhilsethin494@gmail.com' ]
   Subject: URGENT: High Danger SOS in [City]
   Content: Danger Level: [Score]. Post ID: [ID]
   From: onboarding@resend.dev
✅ Email sent successfully!
```

**If you see error messages instead**, continue to Step 2.

---

## Common Issues & Solutions

### Issue 1: Missing Resend API Key ❌

**Error Message:**
```
⚠️ WARNING: mail_resend_key is not configured in .env file!
❌ Cannot send email: mail_resend_key not configured
```

**Solution:**

1. **Get a Resend API Key:**
   - Go to [https://resend.com](https://resend.com)
   - Sign up for a free account
   - Navigate to "API Keys" in dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

2. **Add to `.env` file:**
   ```env
   mail_resend_key=re_your_actual_api_key_here
   ```

3. **Restart backend server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   cd backend
   npm run dev
   ```

---

### Issue 2: Invalid "From" Email Address ❌

**Error Message:**
```
Error: domain verification required
💡 TIP: Resend requires a verified domain
```

**Solution:**

Resend has strict requirements for the "from" email address. You have two options:

#### Option A: Use Resend Testing Email (Quick, for development)

The code now defaults to `onboarding@resend.dev` which works immediately for testing.

**No action needed** - this is already configured!

**Limitations:**
- Only works for testing
- May have rate limits
- Emails might go to spam

#### Option B: Verify Your Own Domain (Recommended for production)

1. **Add your domain in Resend:**
   - Go to Resend dashboard → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `yourdomain.com`)
   - Follow DNS verification steps

2. **Update `.env` file:**
   ```env
   RESEND_FROM_EMAIL=alerts@yourdomain.com
   ```

3. **Restart backend server**

---

### Issue 3: No Central Admin Found ❌

**Symptom:** No emails sent because no admins match the criteria

**Check:**
```javascript
// The code finds admins with this query:
{
  $or: [
    { role: 'central_admin' },
    { role: 'state_admin', state: 'California' },
    { role: 'city_admin', city: 'Los Angeles' }
  ]
}
```

**Solution:**

1. **Verify your admin account exists:**
   - Open MongoDB Compass or use MongoDB CLI
   - Check the `users` collection
   - Find user with email `nikhilsethin494@gmail.com`
   - Verify `role` field is `'central_admin'`

2. **If admin doesn't exist, create one:**
   ```javascript
   // In MongoDB shell or Compass:
   db.users.insertOne({
     name: "Nikhil Sethi",
     email: "nikhilsethin494@gmail.com",
     password: "$2a$10$...", // Use bcrypt hash
     phone: "1234567890",
     role: "central_admin",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

---

### Issue 4: Danger Score Too Low ❌

**Symptom:** SOS created but no email sent

**Reason:** Emails are only sent when `dangerScore > 50`

**Check backend logs:**
```
🎯 Final Danger Score: 45  // Too low!
```

**Solution:**

1. **Test with high-danger keywords:**
   - Create SOS with text: "FIRE! URGENT HELP NEEDED!"
   - Or: "Earthquake! Building collapse!"
   - These trigger higher danger scores

2. **Check ML service:**
   - Ensure ML service is running on the configured port
   - Check `ML_SERVICE_URL` in `.env`

---

## Testing Email Functionality

### Test Script

Create a test file to verify email sending:

```javascript
// test-email.js
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.mail_resend_key);

async function testEmail() {
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['nikhilsethin494@gmail.com'],
            subject: 'ResQQ Email Test',
            html: '<strong>If you receive this, email is working!</strong>'
        });
        
        console.log('✅ Test email sent!', data);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testEmail();
```

**Run test:**
```bash
cd backend
node test-email.js
```

---

## Current Configuration

Based on your setup, here's what should be configured:

### `.env` file should contain:

```env
# Email Configuration
mail_resend_key=re_your_actual_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev  # Optional, defaults to this

# Other settings...
PORT=5000
MONGO_URI=mongodb://localhost:27017/resqq
JWT_SECRET=your_secret_key
```

### Your admin account:

```javascript
{
  email: "nikhilsethin494@gmail.com",
  role: "central_admin",
  isActive: true
}
```

---

## Verification Checklist

- [ ] Resend API key added to `.env` file
- [ ] Backend server restarted after adding API key
- [ ] Central admin account exists with email `nikhilsethin494@gmail.com`
- [ ] Admin account has `role: 'central_admin'`
- [ ] Admin account has `isActive: true`
- [ ] Test SOS created with danger score > 50
- [ ] Backend logs show "📧 Attempting to send email..."
- [ ] Backend logs show "✅ Email sent successfully!"
- [ ] Check spam folder in Gmail

---

## Still Not Working?

### Check Resend Dashboard

1. Go to [https://resend.com/emails](https://resend.com/emails)
2. Check if emails appear in the logs
3. Look for delivery status and any errors

### Enable Detailed Logging

The updated `emailService.js` now includes detailed logging. Check your backend terminal for:
- Recipient emails
- Subject line
- Email content
- Resend API response
- Detailed error messages with tips

### Contact Support

If none of the above works:
1. Check Resend status page: [https://status.resend.com](https://status.resend.com)
2. Review Resend documentation: [https://resend.com/docs](https://resend.com/docs)
3. Check Resend API limits on your account

---

## Summary

**Most Common Fix:**

1. Get Resend API key from [https://resend.com](https://resend.com)
2. Add to `.env`: `mail_resend_key=re_your_key_here`
3. Restart backend server
4. Create high-danger SOS (use keywords like "fire", "urgent", "help")
5. Check backend logs for email confirmation
6. Check Gmail (including spam folder)

The enhanced email service now provides detailed diagnostics to help you identify exactly what's wrong!
