import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    console.log('[EMAIL] 🚀 === EMAIL APPROVAL PROCESS STARTED ===')
    console.log('[EMAIL] 📍 Step 0: Basic info')
    console.log('[EMAIL] - URL:', event.node.req.url)
    console.log('[EMAIL] - Method:', event.node.req.method)
    console.log('[EMAIL] - Timestamp:', new Date().toISOString())
    console.log('[EMAIL] - Node version:', process.version)
    console.log('[EMAIL] - Platform:', process.platform)
    
    // Get runtime config untuk akses environment variables
    const config = useRuntimeConfig()
    console.log('[EMAIL] 🔧 Runtime config loaded')
    
    // Ambil konfigurasi dari environment
    const apiKeyEmail = config.apiKeyEmail
    const emailSender = config.email
    const apiUrlEmail = config.apiUrlEmail
    console.log('[EMAIL] Runtime config:', { apiKeyEmail, emailSender, apiUrlEmail })

    if (!apiKeyEmail || !emailSender || !apiUrlEmail) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Konfigurasi email tidak lengkap (API_KEY_EMAIL, EMAIL, API_URL_EMAIL)'
      })
    }

    console.log('[EMAIL] 📦 Step 1: Creating email sender using mailketing.co.id...')
    
    // Ambil data dari body
    const body = await readBody(event)
    const { userEmail, userName, invoiceNumber, planName, amount, startDate, endDate } = body

    console.log('[EMAIL] 📋 Step 2: Extracted data:', { 
      userEmail, 
      userName, 
      invoiceNumber, 
      planName, 
      amount, 
      startDate, 
      endDate 
    })

    console.log('[EMAIL] ✅ Step 3: Validating required fields...')
    if (!userEmail || !invoiceNumber) {
      console.error('[EMAIL] ❌ Missing required fields:', { 
        userEmail: !!userEmail, 
        invoiceNumber: !!invoiceNumber
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Email dan invoice number diperlukan'
      })
    }
    console.log('[EMAIL] ✅ Required fields validation passed')

    console.log('[EMAIL] 📝 Step 4: Creating email template...')
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🌿 Nutra USA Indonesia - WA CS AGENT AI</h2>
            <h3 style="color: #1e293b;">Pembayaran Berhasil Disetujui!</h3>
            <div class="status-badge">✅ APPROVED</div>
        </div>

        <p>Halo <strong>${userName || 'Pelanggan'}</strong>,</p>
        <p>Pembayaran Anda telah berhasil disetujui dan diproses.</p>

        <div class="invoice-details">
            <h3>Detail Pembayaran:</h3>
            <div class="detail-row">
                <span class="detail-label">Nomor Invoice:</span>
                <span class="detail-value">${invoiceNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Paket:</span>
                <span class="detail-value">${planName || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Jumlah:</span>
                <span class="detail-value amount">Rp ${amount ? Number(amount).toLocaleString('id-ID') : 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #10b981;">DISETUJUI</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tanggal:</span>
                <span class="detail-value">${new Date().toLocaleDateString('id-ID')}</span>
            </div>
        </div>

        <p>Akun Anda sekarang sudah aktif!</p>
        <p>Terima kasih telah mempercayai layanan kami.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #64748b; font-size: 14px;">
            <p><strong>Tim Nutra USA Indonesia</strong></p>
            <p>cs@wagen.id</p>
        </div>
    </div>
</body>
</html>
    `

    console.log('[EMAIL] ✅ Template created, length:', emailTemplate.length)

    console.log('[EMAIL] 📮 Step 5: Preparing mail options...')
    const mailOptions = {
      from: {
        name: 'Nutra USA Indonesia',
        address: config.EMAIL|| 'cs@wagen.id'
      },
      to: userEmail,
      subject: `✅ Pembayaran Disetujui - Invoice ${invoiceNumber}`,
      html: emailTemplate,
      text: `
Halo ${userName || 'Pelanggan'},

Pembayaran Anda telah berhasil disetujui!

Detail:
- Invoice: ${invoiceNumber}
- Paket: ${planName || 'N/A'}
- Jumlah: Rp ${amount ? Number(amount).toLocaleString('id-ID') : 'N/A'}

Akun Anda sekarang sudah aktif.

Terima kasih,
Tim Nutra USA Indonesia
      `
    }

    console.log('[EMAIL] 📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: mailOptions.html.length,
      textLength: mailOptions.text.length
    })

    console.log('[EMAIL] 🚀 Step 6: Sending email via mailketing.co.id...')
    let info
    try {
      // Siapkan payload untuk mailketing.co.id
      const payload = {
        api_key: apiKeyEmail,
        from: emailSender,
        to: userEmail,
        subject: `✅ Pembayaran Disetujui - Invoice ${invoiceNumber}`,
        html: emailTemplate,
        text: `
Halo ${userName || 'Pelanggan'},

Pembayaran Anda telah berhasil disetujui!

Detail:
- Invoice: ${invoiceNumber}
- Paket: ${planName || 'N/A'}
- Jumlah: Rp ${amount ? Number(amount).toLocaleString('id-ID') : 'N/A'}

Akun Anda sekarang sudah aktif.

Terima kasih,
Tim Nutra USA Indonesia
      `
      }
      
      // Kirim request ke mailketing.co.id
      const response = await fetch(apiUrlEmail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok || result.status !== 'success') {
        throw createError({
          statusCode: 500,
          statusMessage: result.message || 'Gagal mengirim email via mailketing.co.id'
        })
      }

      console.log('[EMAIL] ✅ Email sent successfully!')
      console.log('[EMAIL] 📬 Send result:', {
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected
      })
    } catch (sendError) {
      console.error('[EMAIL] ❌ Failed to send email:', sendError);
      
      // Extract more details from the error
      const errorDetails = {
        message: sendError.message,
        stack: sendError.stack,
        cause: sendError.cause,
      };

      console.error('[EMAIL] Send error details:', errorDetails);

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send email: ${sendError.message}`,
        data: errorDetails, // Pass details in the data field
      });
    }

    console.log('[EMAIL] 🎉 Step 7: Preparing response...')
    const response = {
      success: true,
      message: 'Email approval berhasil dikirim',
      timestamp: new Date().toISOString()
    }

    console.log('[EMAIL] ✅ Response:', response)
    console.log('[EMAIL] 🏁 === EMAIL APPROVAL PROCESS COMPLETED ===')
    
    return response

  } catch (error) {
    console.error('[EMAIL] 💥 === CRITICAL ERROR ===')
    console.error('[EMAIL] Error message:', error.message)
    console.error('[EMAIL] Error details:', {
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage
    })
    console.error('[EMAIL] Stack trace:', error.stack)
    console.error('[EMAIL] === END ERROR ===')
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: `Gagal mengirim email: ${error.message}`
    })
  }
})
