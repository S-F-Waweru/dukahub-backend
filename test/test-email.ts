// src/tests/test-email.ts
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

// âœ… Load .env from project root (2 levels up from src/tests)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testEmail() {
  console.log('🔍 Testing Gmail Configuration...\n');

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASSWORD;

  console.log(`Gmail User: ${user || 'MISSING'}`);
  console.log(`Gmail Password: ${pass ? '****' + pass.slice(-4) : 'MISSING'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'MISSING'}\n`);

  if (!user || !pass) {
    console.error('❌ Gmail credentials are missing in .env file!');
    console.error('📁 Looking for .env at:', path.resolve(__dirname, '../../.env'));
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  try {
    console.log('📧 Sending test email...');

    const info = await transporter.sendMail({
      from: user,
      to: user, // Send to yourself for testing
      subject: 'DukaHub Test Email ✅',
      html: `
        <h2>✅ Email Configuration Successful!</h2>
        <p>Your Gmail account is properly configured for DukaHub.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666;">This is a test email from DukaHub backend.</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log('\n🎉 Gmail is ready to use in your project!');
  } catch (error: any) {
    console.error('❌ Failed to send email:');
    console.error(error.message);

    if (error.message.includes('Invalid login')) {
      console.error('\n💡 Solution: Check your app password is correct (16 chars, no spaces)');
    } else if (error.message.includes('getaddrinfo')) {
      console.error('\n💡 Solution: Check your internet connection');
    }
  }
}

testEmail();
