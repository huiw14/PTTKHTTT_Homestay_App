# Email Service Setup

## Overview
The email service allows the system to send payment request emails to customers. It uses **Nodemailer** to send emails via SMTP.

## Installation

1. **Install Nodemailer:**
```bash
cd backend
npm install nodemailer
```

## Configuration

### 1. Set up Gmail Account (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to https://accounts.google.com/security

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the generated 16-character password

3. **Update `.env` file:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=noreply@homestay.com
```

### 2. Using Other Email Services

For Outlook/Office365:
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

For SendGrid:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxx
```

## Features

### 1. Send Payment Request Email
When a staff member clicks **"Gửi KH"** button, the system sends a payment request email with:
- Deposit record ID
- Room name
- Amount
- Payment deadline
- Visual formatting and branding

**Endpoint:** `POST /api/deposits/:id/send-payment-request`

### 2. Payment Confirmation Email (Optional)
Can be triggered when payment is approved:
- Confirmation of payment
- Access information
- Next steps

**Usage:** Call `sendPaymentConfirmationEmail()` in controller after approving payment

## Testing Email Service

### Manual Test
```bash
# Test if nodemailer is installed
npm list nodemailer
```

### Send Test Email
1. Start the backend server: `npm run dev`
2. Make a POST request:
```bash
curl -X POST http://localhost:5000/api/deposits/PC001/send-payment-request
```

3. Check customer's email inbox (and spam folder)

## Troubleshooting

### Email Not Sending
- Check `.env` file is properly configured
- Verify email credentials are correct
- Check Gmail App Passwords if using Gmail
- Enable "Less secure app access" if needed (not recommended)

### Installation Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm install nodemailer
```

### Check Server Logs
```bash
# Look for email service warnings/errors
npm run dev
```

## Email Templates

Current templates available:
1. **depositPaymentEmailTemplate** - Payment request email
2. **sendPaymentConfirmationEmail** - Payment confirmation email

To customize:
- Edit [emailService.js](src/services/emailService.js)
- Modify HTML templates
- Update styling as needed

## Security Notes

⚠️ **Important:**
- Never commit `.env` file with real credentials
- Use App Passwords instead of main Gmail password
- Consider using environment variables in production
- Implement rate limiting to prevent spam

## Future Enhancements

- [ ] Email templates with custom branding
- [ ] Batch email sending
- [ ] Email logs/history
- [ ] Email retry mechanism
- [ ] SMS fallback option
- [ ] Notification preferences
