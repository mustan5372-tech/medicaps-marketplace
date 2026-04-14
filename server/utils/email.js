const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

exports.sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`
  await transporter.sendMail({
    from: `"MediCaps Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email - MediCaps Marketplace',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#2563eb">Verify your email</h2>
      <p>Click the button below to verify your MediCaps Marketplace account.</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
      <p style="color:#888;font-size:12px;margin-top:16px">Link expires in 24 hours.</p>
    </div>`,
  })
}

exports.sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`
  await transporter.sendMail({
    from: `"MediCaps Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your password - MediCaps Marketplace',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#2563eb">Reset Password</h2>
      <p>Click below to reset your password. Link expires in 1 hour.</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
    </div>`,
  })
}

exports.sendEbookRequestEmail = async ({ bookName, subject, branch, userEmail, userName }) => {
  await transporter.sendMail({
    from: `"MediCaps Marketplace" <${process.env.EMAIL_USER}>`,
    to: 'mustan5372@gmail.com',
    subject: `📚 New Ebook Request: ${bookName}`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#6366f1">New Ebook Request</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;color:#888">Book Name</td><td style="padding:8px;font-weight:600">${bookName}</td></tr>
        <tr><td style="padding:8px;color:#888">Subject</td><td style="padding:8px">${subject}</td></tr>
        <tr><td style="padding:8px;color:#888">Branch</td><td style="padding:8px">${branch}</td></tr>
        <tr><td style="padding:8px;color:#888">Requested By</td><td style="padding:8px">${userName} (${userEmail})</td></tr>
      </table>
    </div>`,
  })
}
