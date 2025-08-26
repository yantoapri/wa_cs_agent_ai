export default defineEventHandler(async (event) => {
  console.log('[SEND-EMAIL] === EMAIL APPROVAL PROCESS STARTED ===')
  console.log('[SEND-EMAIL] Request URL:', event.node.req.url)
  console.log('[SEND-EMAIL] Request method:', event.node.req.method)
  console.log('[SEND-EMAIL] Timestamp:', new Date().toISOString())
  console.log('[SEND-EMAIL] Node version:', process.version)
  console.log('[SEND-EMAIL] Platform:', process.platform)
  
  // Try different approaches for importing nodemailer
  console.log('[SEND-EMAIL] Attempting to import nodemailer...')
  let nodemailer
  
  try {
    // Method 1: Direct dynamic import with inspection
    console.log('[SEND-EMAIL] Method 1: Direct dynamic import with inspection')
    const nodemailerModule = await import('nodemailer')
    console.log('[SEND-EMAIL] Module inspection:', {
      hasDefault: !!nodemailerModule.default,
      hasCreateTransport: !!nodemailerModule.createTransport,
      defaultType: typeof nodemailerModule.default,
      moduleType: typeof nodemailerModule,
      moduleKeys: Object.keys(nodemailerModule),
      defaultKeys: nodemailerModule.default ? Object.keys(nodemailerModule.default) : 'N/A'
    })
    
    // Try different ways to get the right export
    if (nodemailerModule.createTransport) {
      // Direct export
      nodemailer = nodemailerModule
      console.log('[SEND-EMAIL] ✓ Using direct module export')
    } else if (nodemailerModule.default && nodemailerModule.default.createTransport) {
      // Default export
      nodemailer = nodemailerModule.default
      console.log('[SEND-EMAIL] ✓ Using default export')
    } else {
      throw new Error('createTransport not found in any export')
    }
    
  } catch (error1) {
    console.log('[SEND-EMAIL] Method 1 failed:', error1.message)
    
    try {
      // Method 2: CommonJS style with createRequire
      console.log('[SEND-EMAIL] Method 2: CommonJS require')
      const { createRequire } = await import('module')
      const require = createRequire(import.meta.url)
      nodemailer = require('nodemailer')
      console.log('[SEND-EMAIL] ✓ Method 2 successful')
    } catch (error2) {
      console.log('[SEND-EMAIL] Method 2 failed:', error2.message)
      
      try {
        // Method 3: Legacy require approach
        console.log('[SEND-EMAIL] Method 3: Legacy require')
        const Module = await import('module')
        const require = Module.createRequire ? Module.createRequire(import.meta.url) : eval('require')
        nodemailer = require('nodemailer')
        console.log('[SEND-EMAIL] ✓ Method 3 successful')
      } catch (error3) {
        console.error('[SEND-EMAIL] All import methods failed:', {
          error1: error1.message,
          error2: error2.message,
          error3: error3.message
        })
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to import nodemailer. Errors: ${error1.message} | ${error2.message} | ${error3.message}`
        })
      }
    }
  }
  
  if (!nodemailer || !nodemailer.createTransport) {
    console.error('[SEND-EMAIL] ERROR: Nodemailer not properly imported:', {
      hasNodemailer: !!nodemailer,
      hasCreateTransport: !!(nodemailer?.createTransport),
      nodeMailerType: typeof nodemailer,
      nodeMailerKeys: nodemailer ? Object.keys(nodemailer) : 'N/A'
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Nodemailer createTransport method not available'
    })
  }
  
  console.log('[SEND-EMAIL] ✓ Nodemailer imported successfully')
  console.log('[SEND-EMAIL] CreateTransport type:', typeof nodemailer.createTransport)
  
  // Early environment check
  console.log('[SEND-EMAIL] Environment variables check:')
  console.log('[SEND-EMAIL] - NODE_ENV:', process.env.NODE_ENV)
  console.log('[SEND-EMAIL] - SMTP_USER exists:', !!process.env.SMTP_USER)
  console.log('[SEND-EMAIL] - SMTP_PASS exists:', !!process.env.SMTP_PASS)
  console.log('[SEND-EMAIL] - SMTP_USER value:', process.env.SMTP_USER)
  console.log('[SEND-EMAIL] - SMTP_PASS length:', process.env.SMTP_PASS?.length || 0)
  
  try {
    console.log('[SEND-EMAIL] Step 1: Reading request body...')
    const body = await readBody(event)
    console.log('[SEND-EMAIL] Request body received:', JSON.stringify(body, null, 2))
    
    const { userEmail, userName, invoiceNumber, planName, amount, startDate, endDate } = body
    console.log('[SEND-EMAIL] Step 2: Destructured data:', { 
      userEmail, 
      userName, 
      invoiceNumber, 
      planName, 
      amount, 
      startDate, 
      endDate 
    })

    console.log('[SEND-EMAIL] Step 3: Validating required fields...')
    // Validasi input
    if (!userEmail || !invoiceNumber) {
      console.error('[SEND-EMAIL] ERROR: Missing required fields:', { 
        userEmail: !!userEmail, 
        invoiceNumber: !!invoiceNumber,
        userEmailValue: userEmail,
        invoiceNumberValue: invoiceNumber
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Email dan invoice number diperlukan'
      })
    }
    console.log('[SEND-EMAIL] ✓ Required fields validation passed')

    console.log('[SEND-EMAIL] Step 4: Checking environment variables...')
    // Validasi environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[SEND-EMAIL] ERROR: Missing SMTP configuration:', { 
        SMTP_USER: !!process.env.SMTP_USER, 
        SMTP_PASS: !!process.env.SMTP_PASS,
        SMTP_USER_VALUE: process.env.SMTP_USER,
        SMTP_PASS_LENGTH: process.env.SMTP_PASS?.length || 0
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'SMTP configuration not found'
      })
    }
    
    // Validasi format App Password Gmail (16 karakter)
    const smtpPass = process.env.SMTP_PASS
    if (smtpPass.length !== 16 || !/^[a-zA-Z]{16}$/.test(smtpPass)) {
      console.warn('[SEND-EMAIL] WARNING: SMTP_PASS tidak sesuai format App Password Gmail')
      console.warn('[SEND-EMAIL] App Password Gmail seharusnya 16 karakter huruf saja')
      console.warn('[SEND-EMAIL] Current SMTP_PASS:', {
        length: smtpPass.length,
        isAlphaOnly: /^[a-zA-Z]+$/.test(smtpPass),
        value: smtpPass
      })
      console.warn('[SEND-EMAIL] Silakan generate App Password baru di Google Account Settings')
    }
    
    console.log('[SEND-EMAIL] ✓ Environment variables validation passed')

    console.log('[SEND-EMAIL] Step 5: Creating SMTP transporter...')
    // Konfigurasi transporter email dengan setting yang lebih spesifik untuk Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS // Harus menggunakan App Password, bukan password biasa
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    console.log('[SEND-EMAIL] ✓ SMTP transporter created successfully')
    console.log('[SEND-EMAIL] SMTP Configuration details:', {
      host: 'smtp.gmail.com',
      port: 587,
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS?.length || 0,
      secure: false,
      tls: { rejectUnauthorized: false }
    })

    console.log('[SEND-EMAIL] Step 6: Testing SMTP connection...')
    // Test koneksi SMTP
    try {
      console.log('[SEND-EMAIL] 6.1: Initiating SMTP verification...')
      await transporter.verify()
      console.log('[SEND-EMAIL] ✓ SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('[SEND-EMAIL] ERROR: SMTP verification failed:', verifyError)
      console.error('[SEND-EMAIL] Error details:', {
        message: verifyError.message,
        code: verifyError.code,
        command: verifyError.command,
        response: verifyError.response,
        responseCode: verifyError.responseCode
      })
      
      // Berikan panduan khusus untuk error Gmail
      let errorMessage = verifyError.message
      if (errorMessage.includes('Username and Password not accepted') || errorMessage.includes('BadCredentials')) {
        errorMessage = `Gmail authentication failed. Pastikan:
1. Menggunakan App Password (bukan password akun biasa)
2. 2-Factor Authentication sudah diaktifkan di Gmail
3. App Password sudah dibuat di Google Account Settings
4. Email: ${process.env.SMTP_USER}
5. App Password length: ${process.env.SMTP_PASS?.length || 0} characters

Original error: ${verifyError.message}`
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: `SMTP connection failed: ${errorMessage}`
      })
    }

    console.log('[SEND-EMAIL] Step 7: Creating email template...')
    // Template email HTML
    const emailTemplate = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pembayaran Disetujui</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e1e5e9;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .status-badge {
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
        }
        .invoice-details {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        .detail-label {
            font-weight: 600;
            color: #64748b;
        }
        .detail-value {
            font-weight: 500;
            color: #1e293b;
        }
        .amount {
            color: #10b981;
            font-size: 18px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e1e5e9;
            color: #64748b;
            font-size: 14px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌿 Nutra USA Indonesia - WA CS AGENT AI</div>
            <h2 style="color: #1e293b; margin: 0;">Pembayaran Berhasil Disetujui!</h2>
            <div class="status-badge">✅ APPROVED</div>
        </div>

        <p>Halo <strong>${userName || 'Pelanggan'}</strong>,</p>

        <p>Kami dengan senang hati memberitahukan bahwa pembayaran Anda telah berhasil disetujui dan diproses.</p>

        <div class="invoice-details">
            <h3 style="margin-top: 0; color: #1e293b;">Detail Pembayaran:</h3>
            <div class="detail-row">
                <span class="detail-label">Nomor Invoice:</span>
                <span class="detail-value">${invoiceNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Paket Berlangganan:</span>
                <span class="detail-value">${planName || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Jumlah Pembayaran:</span>
                <span class="detail-value amount">Rp ${amount ? Number(amount).toLocaleString('id-ID') : 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #10b981; font-weight: bold;">DISETUJUI</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tanggal Approval:</span>
                <span class="detail-value">${new Date().toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
            </div>
        </div>

        <p><strong>Akun Anda sekarang sudah aktif!</strong> Anda dapat mulai menggunakan semua fitur yang tersedia dalam paket berlangganan Anda.</p>

        <div style="text-align: center;">
            <a href="${process.env.VITE_PUBLIC_BASE_URL || 'https://your-domain.com'}/login" class="cta-button">
                🚀 Mulai Menggunakan Layanan
            </a>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
                <strong>💡 Tips:</strong> Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi tim support kami.
            </p>
        </div>

        <p>Terima kasih telah mempercayai layanan kami!</p>

        <div class="footer">
            <p><strong>Tim Nutra USA Indonesia</strong></p>
            <p>Email: nutrausaindonesia@gmail.com</p>
            <p style="font-size: 12px; color: #9ca3af;">
                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
            </p>
        </div>
    </div>
</body>
</html>
    `

    // Konfigurasi email
    const mailOptions = {
      from: {
        name: 'Nutra USA Indonesia',
        address: process.env.SMTP_USER
      },
      to: userEmail,
      subject: `✅ Pembayaran Disetujui - Invoice ${invoiceNumber}`,
      html: emailTemplate,
      // Text fallback
      text: `
Halo ${userName || 'Pelanggan'},

Pembayaran Anda telah berhasil disetujui!

Detail Pembayaran:
- Nomor Invoice: ${invoiceNumber}
- Paket: ${planName || 'N/A'}
- Jumlah: Rp ${amount ? Number(amount).toLocaleString('id-ID') : 'N/A'}
- Status: DISETUJUI
- Tanggal Mulai: ${startDate || 'N/A'}
- Tanggal Berakhir: ${endDate || 'N/A'}

Akun Anda sekarang sudah aktif dan siap digunakan.

Terima kasih,
Tim Nutra USA Indonesia
Email: nutrausaindonesia@gmail.com
      `
    }

    console.log('[SEND-EMAIL] ✓ Email template created successfully')
    console.log('[SEND-EMAIL] Template length:', emailTemplate.length)

    console.log('[SEND-EMAIL] Step 8: Preparing mail options...')
    console.log('[SEND-EMAIL] Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text,
      htmlLength: mailOptions.html?.length || 0,
      textLength: mailOptions.text?.length || 0
    })

    console.log('[SEND-EMAIL] Step 9: Attempting to send email...')
    console.log('[SEND-EMAIL] Sending email to:', userEmail)

    // Kirim email
    let info
    try {
      console.log('[SEND-EMAIL] 9.1: Calling transporter.sendMail...')
      info = await transporter.sendMail(mailOptions)
      console.log('[SEND-EMAIL] ✓ Email sent successfully!')
      console.log('[SEND-EMAIL] Email details:', {
        messageId: info.messageId,
        response: info.response,
        envelope: info.envelope,
        accepted: info.accepted,
        rejected: info.rejected,
        pending: info.pending
      })
    } catch (sendError) {
      console.error('[SEND-EMAIL] ERROR: Failed to send email:', sendError)
      console.error('[SEND-EMAIL] Send error details:', {
        message: sendError.message,
        code: sendError.code,
        command: sendError.command,
        response: sendError.response,
        responseCode: sendError.responseCode,
        stack: sendError.stack
      })
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send email: ${sendError.message}`
      })
    }

    console.log('[SEND-EMAIL] Step 10: Preparing response...')
    const response = {
      success: true,
      message: 'Email approval berhasil dikirim',
      messageId: info.messageId,
      recipient: userEmail
    }
    console.log('[SEND-EMAIL] Response prepared:', response)
    console.log('[SEND-EMAIL] === EMAIL APPROVAL PROCESS COMPLETED SUCCESSFULLY ===')

    return response

  } catch (error) {
    console.error('[SEND-EMAIL] === CRITICAL ERROR IN EMAIL APPROVAL PROCESS ===')
    console.error('[SEND-EMAIL] Error object:', error)
    console.error('[SEND-EMAIL] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: error.data
    })
    console.error('[SEND-EMAIL] Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      smtpUser: !!process.env.SMTP_USER,
      smtpPass: !!process.env.SMTP_PASS,
      smtpUserValue: process.env.SMTP_USER,
      smtpPassLength: process.env.SMTP_PASS?.length || 0
    })
    console.error('[SEND-EMAIL] === END CRITICAL ERROR ===')
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: `Gagal mengirim email: ${error.message}`
    })
  }
})
