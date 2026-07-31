require('dotenv').config();
const { SendMailClient } = require('zeptomail');

// ============================================================
// 📧 EMAIL CONFIGURATION
// ============================================================

// ✅ Token
const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_API_KEY || process.env.ZEPTOMAIL_TOKEN;

// ✅ Email addresses (with fallbacks)
const FROM_EMAIL = process.env.WELCOME_EMAIL;
const ALERTS_EMAIL = process.env.ALERTS_EMAIL;
const WELCOME_EMAIL = process.env.WELCOME_EMAIL;

// ✅ Names
const WELCOME_NAME = process.env.WELCOME_NAME || 'Complyzo';
const ALERTS_NAME = process.env.ALERTS_NAME || 'Complyzo Alerts';

// ✅ SAFE logging
console.log('📧 Email Configuration:');
console.log(`   Token: ${ZEPTOMAIL_TOKEN ? '✅ Set' : '❌ Not Set'}`);
console.log(`   Welcome Email: ${WELCOME_EMAIL}`);
console.log(`   Alert Email: ${ALERTS_EMAIL}`);
console.log(`   Welcome Name: ${WELCOME_NAME}`);
console.log(`   Alert Name: ${ALERTS_NAME}`);

// ✅ Initialize ZeptoMail client
let client = null;

if (ZEPTOMAIL_TOKEN) {
  try {
    client = new SendMailClient({
      url: 'https://api.zeptomail.in/v1.1/email',
      token: ZEPTOMAIL_TOKEN
    });
    console.log('✅ ZeptoMail client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize ZeptoMail client:', error.message);
  }
} else {
  console.log('⚠️ ZEPTOMAIL_API_KEY not set - Email sending disabled');
}

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================================
// 📧 SEND WELCOME EMAIL
// ============================================================

exports.sendWelcomeEmail = async (user, password) => {
  try {
    if (process.env.DISABLE_EMAILS === 'true') {
      console.log('📧 [DISABLED] Welcome email would be sent to:', user.email);
      console.log(`🔑 Password: ${password || 'Not set'}`);
      return true;
    }

    if (!user?.email) {
      console.log('❌ No email provided');
      return false;
    }

    if (!client) {
      console.log('⚠️ Email client not initialized');
      console.log(`📧 Would have sent to: ${user.email}`);
      return false;
    }

    if (!WELCOME_EMAIL) {
      console.log('⚠️ No welcome sender email configured');
      return false;
    }

    console.log(`📧 Sending welcome email to: ${user.email}`);
    console.log(`   From: ${WELCOME_EMAIL}`);

    await client.sendMail({
      from: {
        address: WELCOME_EMAIL,
        name: WELCOME_NAME
      },
      to: [{
        email_address: {
          address: user.email,
          name: user.name || 'User'
        }
      }],
      subject: '🎉 Welcome to Complyzo! Your account is ready',
      htmlbody: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #111827; padding: 32px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700;">Welcome to Complyzo! 🚀</h1>
            <p style="color: #9CA3AF; margin: 8px 0 0; font-size: 14px;">Your account has been created successfully</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">
              Hi <strong>${user.name || 'there'}</strong>,
            </p>
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px; line-height: 1.7;">
              Thank you for signing up with Complyzo! Your account is now active and ready to use.
            </p>
            
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;">🔑</span>
                <div>
                  <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0;">Your Login Credentials</p>
                  <p style="color: #15803D; font-size: 12px; margin: 4px 0 0;">
                    <strong>Email:</strong> ${user.email}<br>
                    <strong>Password:</strong> ${password || user.email}
                  </p>
                  <p style="color: #15803D; font-size: 11px; margin: 4px 0 0;">
                    ⚠️ Please change your password after login
                  </p>
                </div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${frontendUrl}/dashboard" style="display: inline-block; background: #2563EB; color: #FFFFFF; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                Go to Dashboard →
              </a>
            </div>
          </div>
          <div style="border-top: 1px solid #E5E7EB; padding: 16px 24px; text-align: center; background: #F9FAFB;">
            <p style="color: #9CA3AF; font-size: 11px; margin: 0;">Sent by Complyzo · <a href="${frontendUrl}/settings" style="color: #6B7280;">Notification Settings</a></p>
          </div>
        </div>
      `
    });

    console.log('✅ Welcome email sent successfully to:', user.email);
    return true;

  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
    if (error.response) {
      console.error('📋 ZeptoMail Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
};

// ============================================================
// 📧 SEND ALERT EMAIL - FIXED
// ============================================================

exports.sendEmailAlert = async (userId, websiteUrl, issues) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user?.email) {
      console.log('❌ User not found for alert email');
      return false;
    }

    if (process.env.DISABLE_EMAILS === 'true') {
      console.log('📧 [DISABLED] Alert email would be sent to:', user.email);
      return true;
    }

    if (!client) {
      console.log('⚠️ Email client not initialized');
      console.log(`📧 Would have sent to: ${user.email}`);
      return false;
    }

    if (!ALERTS_EMAIL) {
      console.log('⚠️ No alert sender email configured');
      console.log(`📧 Would have sent to: ${user.email}`);
      return false;
    }

    const criticalCount = issues.filter(i => i.severity === 'Critical').length;
    const warningCount = issues.filter(i => i.severity === 'Warning').length;
    const issuesList = issues.map(i => `<li>${i.severity}: ${i.message}</li>`).join('');

    console.log(`📧 Sending alert email to: ${user.email}`);
    console.log(`   From: ${ALERTS_EMAIL}`);
    console.log(`   Website: ${websiteUrl}`);
    console.log(`   Issues: ${issues.length} (${criticalCount} critical, ${warningCount} warnings)`);

    await client.sendMail({
      from: {
        address: ALERTS_EMAIL,
        name: ALERTS_NAME
      },
      to: [{
        email_address: {
          address: user.email,
          name: user.name || 'User'
        }
      }],
      subject: `🚨 ${issues.length} issues found on ${websiteUrl}`,
      htmlbody: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #111827; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 700;">🔍 Scan Report</h1>
            <p style="color: #9CA3AF; margin: 4px 0 0; font-size: 14px;">${websiteUrl}</p>
          </div>
          <div style="padding: 24px;">
            <div style="display: flex; gap: 12px; margin-bottom: 20px;">
              <div style="flex: 1; text-align: center; background: #FEF2F2; padding: 12px; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: 700; color: #DC2626;">${criticalCount}</div>
                <div style="font-size: 12px; color: #6B7280;">Critical</div>
              </div>
              <div style="flex: 1; text-align: center; background: #FFFBEB; padding: 12px; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: 700; color: #D97706;">${warningCount}</div>
                <div style="font-size: 12px; color: #6B7280;">Warnings</div>
              </div>
              <div style="flex: 1; text-align: center; background: #EFF6FF; padding: 12px; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: 700; color: #2563EB;">${issues.length}</div>
                <div style="font-size: 12px; color: #6B7280;">Total Issues</div>
              </div>
            </div>
            
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Issues Found:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${issuesList}
            </ul>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="${frontendUrl}/dashboard" style="display: inline-block; background: #2563EB; color: #FFFFFF; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                View Dashboard →
              </a>
            </div>
          </div>
          <div style="border-top: 1px solid #E5E7EB; padding: 12px 24px; text-align: center; background: #F9FAFB;">
            <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
              This is an automated report from Complyzo.
              <a href="${frontendUrl}/settings" style="color: #6B7280;">Notification Settings</a>
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Alert email sent successfully to:', user.email);
    return true;

  } catch (error) {
    console.error('❌ Alert email failed:', error.message);
    if (error.response) {
      console.error('📋 ZeptoMail Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
};

// ============================================================
// 🧪 TEST EMAIL CONFIGURATION
// ============================================================

exports.testEmailConfig = async () => {
  console.log('\n🧪 Testing Email Configuration...');
  console.log('='.repeat(50));
  console.log(`   Welcome Email: ${WELCOME_EMAIL || 'Not configured'}`);
  console.log(`   Alert Email: ${ALERTS_EMAIL || 'Not configured'}`);
  console.log(`   Token: ${ZEPTOMAIL_TOKEN ? '✅ Set' : '❌ Not Set'}`);
  console.log(`   Client: ${client ? '✅ Initialized' : '❌ Not Initialized'}`);
  console.log('='.repeat(50));
  
  if (!WELCOME_EMAIL) {
    console.log('\n⚠️ No welcome sender email configured!');
    console.log('   Add to .env: WELCOME_EMAIL=no-reply@albinolabs.com');
    return false;
  }
  
  if (!ALERTS_EMAIL) {
    console.log('\n⚠️ No alert sender email configured!');
    console.log('   Add to .env: ALERTS_EMAIL=no-reply@albinolabs.com');
    return false;
  }
  
  if (!ZEPTOMAIL_TOKEN) {
    console.log('\n⚠️ No ZeptoMail token configured!');
    console.log('   Add to .env: ZEPTOMAIL_API_KEY=your-token-here');
    return false;
  }
  
  if (client) {
    try {
      console.log('\n📧 Sending test email...');
      await client.sendMail({
        from: {
          address: WELCOME_EMAIL,
          name: 'Complyzo Test'
        },
        to: [{
          email_address: {
            address: 'test@example.com',
            name: 'Test User'
          }
        }],
        subject: '🧪 Test Email from Complyzo',
        htmlbody: '<p>This is a test email to verify your ZeptoMail configuration.</p>'
      });
      console.log('✅ Test email sent successfully!');
      return true;
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      if (error.response) {
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      }
      return false;
    }
  }
  
  return false;
};


exports.sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    if (!user?.email) {
      console.log('❌ No email provided');
      return false;
    }

    if (process.env.DISABLE_EMAILS === 'true') {
      console.log('📧 [DISABLED] Password reset email would be sent to:', user.email);
      console.log(`🔗 Reset URL: ${resetUrl}`);
      return true;
    }

    if (!client) {
      console.log('⚠️ Email client not initialized');
      console.log(`📧 Would have sent to: ${user.email}`);
      console.log(`🔗 Reset URL: ${resetUrl}`);
      return false;
    }

    const fromEmail = process.env.WELCOME_EMAIL || process.env.ALERTS_EMAIL || 'no-reply@albinolabs.com';
    const fromName = process.env.WELCOME_NAME || 'Complyzo';

    console.log(`📧 Sending password reset email to: ${user.email}`);

    await client.sendMail({
      from: {
        address: fromEmail,
        name: fromName
      },
      to: [{
        email_address: {
          address: user.email,
          name: user.name || 'User'
        }
      }],
      subject: '🔑 Reset Your Complyzo Password',
      htmlbody: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #111827; padding: 32px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700;">🔑 Reset Your Password</h1>
            <p style="color: #9CA3AF; margin: 8px 0 0; font-size: 14px;">Complyzo Password Reset Request</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">
              Hi <strong>${user.name || 'there'}</strong>,
            </p>
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px; line-height: 1.7;">
              We received a request to reset your Complyzo account password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #2563EB; color: #FFFFFF; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                Reset Password →
              </a>
            </div>

            <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #92400E; font-size: 12px; margin: 0;">
                ⏰ This link will expire in <strong>1 hour</strong>
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 12px; margin: 0 0 8px;">
              If you didn't request this, please ignore this email.
            </p>
            <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
              For security, never share this link with anyone.
            </p>
          </div>
          <div style="border-top: 1px solid #E5E7EB; padding: 16px 24px; text-align: center; background: #F9FAFB;">
            <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
              Sent by Complyzo · <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings" style="color: #6B7280;">Notification Settings</a>
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Password reset email sent to:', user.email);
    return true;

  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
    return false;
  }
};
