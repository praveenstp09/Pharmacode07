import nodemailer from 'nodemailer';

// Helper to escape HTML characters in email templates
const escapeHtml = (str) =>
  String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

export const sendStudentQueryNotification = async (contactData) => {
  const { name, email, mobile, subject, message } = contactData;
  const adminEmail = process.env.ADMIN_EMAIL || 'pharmacode07exams@gmail.com';

  // 1. Check if SMTP configuration exists
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;

  if (!smtpUser || !smtpPass) {
    console.log(`ℹ️ [Email Notifier] New query received from ${name} (${email}). To receive live emails, set SMTP_USER and SMTP_PASS in backend/.env`);
    return { sent: false, reason: 'SMTP credentials not configured in .env' };
  }

  const cleanPass = smtpPass ? smtpPass.replace(/\s+/g, '').trim() : '';
  const cleanUser = smtpUser ? smtpUser.trim() : '';

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMobile = escapeHtml(mobile);
  const safeSubject = escapeHtml(subject || 'General Inquiry');
  const safeMessage = escapeHtml(message);

  try {
    const isGmail = cleanUser.includes('@gmail.com');
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: {
              user: cleanUser,
              pass: cleanPass,
            },
          }
        : {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: cleanUser,
              pass: cleanPass,
            },
          }
    );

    const mailOptions = {
      from: `"PharmaCode07 Support Bot" <${smtpUser}>`,
      to: adminEmail,
      replyTo: email,
      subject: `🚨 [New Student Doubt/Query] ${subject || 'General Inquiry'} - ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 24px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800;">PharmaCode07 — New Student Inquiry</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #bfdbfe;">A student has submitted a doubt/query from your website.</p>
          </div>
          
          <div style="padding: 24px; color: #334155; line-height: 1.6;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b; width: 120px;">Student Name:</td>
                <td style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b;">Email Address:</td>
                <td style="padding: 8px 0; font-size: 14px; color: #2563eb;"><a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${safeEmail}</a></td>
              </tr>
              ${safeMobile ? `
              <tr>
                <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b;">Mobile:</td>
                <td style="padding: 8px 0; font-size: 14px; color: #0f172a;">${safeMobile}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b;">Subject:</td>
                <td style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #4338ca;">${safeSubject}</td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Student's Message:</div>
              <p style="margin: 0; font-size: 14px; color: #1e293b; white-space: pre-wrap;">${safeMessage}</p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(subject || 'Inquiry - PharmaCode07')}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px; text-decoration: none; box-shadow: 0 2px 6px rgba(37,99,235,0.3);">
                Reply to Student Directly ✉️
              </a>
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            This inquiry is also stored in your <a href="https://pharmacode07.onrender.com/admin" style="color: #2563eb; text-decoration: none; font-weight: bold;">Admin Studio Dashboard</a>.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Notifier] Notification sent to ${adminEmail} (MsgId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️ [Email Notifier] Failed to send email notification:', error.message);
    return { sent: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async ({ toEmail, name, resetUrl }) => {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;

  if (!smtpUser || !smtpPass) {
    console.log(`ℹ️ [Email Notifier] Password reset requested for ${toEmail}. Reset URL: ${resetUrl}`);
    return { sent: false, reason: 'SMTP credentials not configured in .env' };
  }

  const cleanPass = smtpPass ? smtpPass.replace(/\s+/g, '').trim() : '';
  const cleanUser = smtpUser ? smtpUser.trim() : '';

  try {
    const isGmail = cleanUser.includes('@gmail.com');
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: {
              user: cleanUser,
              pass: cleanPass,
            },
          }
        : {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: cleanUser,
              pass: cleanPass,
            },
          }
    );

    const safeName = escapeHtml(name || 'Student');
    const safeResetUrl = encodeURI(resetUrl);

    const mailOptions = {
      from: `"PharmaCode07 Support" <${cleanUser}>`,
      to: toEmail,
      subject: '🔐 Reset Your PharmaCode07 Password',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 24px; color: #ffffff; text-align: center;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 800;">PharmaCode07 Password Reset</h2>
          </div>
          
          <div style="padding: 28px; color: #334155; line-height: 1.6;">
            <p style="font-size: 15px; margin-top: 0;">Hello <strong>${safeName}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">We received a request to reset your password for your PharmaCode07 account. Click the button below to set a new password:</p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${safeResetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px; text-decoration: none; box-shadow: 0 4px 10px rgba(37,99,235,0.3);">
                Reset My Password 🔒
              </a>
            </div>

            <p style="font-size: 12px; color: #64748b;">This link will expire in <strong>1 hour</strong>. If you did not request this password reset, please ignore this email and your account will remain secure.</p>
            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">Or copy and paste this URL into your browser:<br>${escapeHtml(resetUrl)}</p>
          </div>

          <div style="background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            © 2026 PharmaCode07. Dedicated to Pharmacy Aspirants across India.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Notifier] Password reset sent to ${toEmail} (MsgId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️ [Email Notifier] Failed to send password reset email:', error.message);
    return { sent: false, error: error.message };
  }
};

export const sendVerificationOTPEmail = async ({ toEmail, name, otp }) => {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;

  if (!smtpUser || !smtpPass) {
    console.log(`ℹ️ [Email Notifier] Verification OTP for ${toEmail}: ${otp}`);
    return { sent: false, reason: 'SMTP credentials not configured in .env' };
  }

  const cleanPass = smtpPass ? smtpPass.replace(/\s+/g, '').trim() : '';
  const cleanUser = smtpUser ? smtpUser.trim() : '';

  try {
    const isGmail = cleanUser.includes('@gmail.com');
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: {
              user: cleanUser,
              pass: cleanPass,
            },
          }
        : {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: cleanUser,
              pass: cleanPass,
            },
          }
    );

    const safeName = escapeHtml(name || 'Student');

    const mailOptions = {
      from: `"PharmaCode07 Support" <${cleanUser}>`,
      to: toEmail,
      subject: `🔐 ${otp} is your PharmaCode07 verification code`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 24px; color: #ffffff; text-align: center;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PharmaCode07</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #bfdbfe;">Email Verification</p>
          </div>
          
          <div style="padding: 28px; color: #334155; line-height: 1.6;">
            <p style="font-size: 15px; margin-top: 0;">Hello <strong>${safeName}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">Thank you for registering on <strong>PharmaCode07</strong>. Please use the following 6-digit verification code to activate your account:</p>

            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #2563eb; border-radius: 14px; padding: 14px 32px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a;">
                  ${otp}
                </span>
              </div>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 6px;">
              ⏱️ This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 0;">
              If you did not request this code, please ignore this email. Never share this OTP with anyone.
            </p>
          </div>

          <div style="background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            © 2026 PharmaCode07 • Pharmacy Exam Preparation Platform
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Notifier] Verification OTP sent to ${toEmail} (MsgId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️ [Email Notifier] Failed to send verification OTP email:', error.message);
    return { sent: false, error: error.message };
  }
};
