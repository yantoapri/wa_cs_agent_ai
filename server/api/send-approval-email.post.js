import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userEmail, userName, invoiceNumber, planName, amount, startDate, endDate } = body

    // Debug log untuk melihat data yang diterima
    console.log('Email data received:', { userEmail, userName, invoiceNumber, planName, amount, startDate, endDate })

    // Validasi input
    if (!userEmail || !invoiceNumber) {
      console.error('Missing required fields:', { userEmail: !!userEmail, invoiceNumber: !!invoiceNumber })
      throw createError({
        statusCode: 400,
        statusMessage: 'Email dan invoice number diperlukan'
      })
    }

    // Validasi environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP configuration:', { 
        SMTP_USER: !!process.env.SMTP_USER, 
        SMTP_PASS: !!process.env.SMTP_PASS 
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'SMTP configuration not found'
      })
    }

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

    console.log('SMTP Configuration:', {
      host: 'smtp.gmail.com',
      port: 587,
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS?.length || 0
    })

    // Test koneksi SMTP
    try {
      console.log('Testing SMTP connection...')
      await transporter.verify()
      console.log('SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError)
      
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

    console.log('Attempting to send email to:', userEmail)

    // Kirim email
    let info
    try {
      info = await transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
    } catch (sendError) {
      console.error('Failed to send email:', sendError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send email: ${sendError.message}`
      })
    }

    return {
      success: true,
      message: 'Email approval berhasil dikirim',
      messageId: info.messageId,
      recipient: userEmail
    }

  } catch (error) {
    console.error('Error sending approval email:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal mengirim email: ${error.message}`
    })
  }
})
