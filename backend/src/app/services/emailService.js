/**
 * Email Service - Gửi email thanh toán và thông báo khác
 * 
 * Cần cài đặt: npm install nodemailer
 * 
 * Biến môi trường cần thiết (.env):
 * EMAIL_HOST=smtp.gmail.com
 * EMAIL_PORT=587
 * EMAIL_USER=your-email@gmail.com
 * EMAIL_PASSWORD=your-app-password
 * EMAIL_FROM=noreply@homestay.com
 */

let nodemailer = null;
let nodemailerReady = false;

// Initialize nodemailer immediately
(async () => {
  try {
    const module = await import('nodemailer');
    nodemailer = module.default;
    nodemailerReady = true;
    console.log('✓ Nodemailer loaded successfully');
  } catch (err) {
    console.warn('⚠️ Nodemailer not installed. Email service disabled.');
    console.warn('   Install with: npm install nodemailer');
  }
})();

// Khởi tạo transporter
const getTransporter = () => {
  if (!nodemailer) {
    console.error('❌ Nodemailer not loaded. Cannot send email.');
    return null;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured in .env file');
    console.error('   Required: EMAIL_USER, EMAIL_PASSWORD');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } catch (err) {
    console.error('❌ Error creating email transporter:', err.message);
    return null;
  }
};

/**
 * Template email yêu cầu thanh toán cọc
 */
const depositPaymentEmailTemplate = (customerName, depositRecordId, roomName, amount, deadline) => {
  return {
    subject: `Yêu cầu thanh toán cọc - Mã phiếu ${depositRecordId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <h1 style="color: #1e3a8a; font-size: 24px; margin-top: 0;">Yêu cầu Thanh toán Cọc</h1>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Chào ${customerName},</p>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Chúng tôi đã lập phiếu cọc cho phòng của bạn. Vui lòng thanh toán cọc theo thông tin dưới đây:
          </p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #1e3a8a; width: 30%;">Mã phiếu:</td>
                <td style="padding: 8px; color: #374151;">${depositRecordId}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold; color: #1e3a8a; width: 30%;">Phòng:</td>
                <td style="padding: 8px; color: #374151;">${roomName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #1e3a8a; width: 30%;">Số tiền:</td>
                <td style="padding: 8px; color: #dc2626; font-weight: bold; font-size: 18px;">${amount.toLocaleString('vi-VN')} đ</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold; color: #1e3a8a; width: 30%;">Hạn thanh toán:</td>
                <td style="padding: 8px; color: #dc2626; font-weight: bold;">${deadline}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #78350f; font-size: 13px; font-weight: bold;">⚠️ Lưu ý:</p>
            <p style="margin: 5px 0 0 0; color: #92400e; font-size: 13px;">
              Phòng/giường sẽ bị khóa trong 24 giờ chờ thanh toán. Nếu quá hạn, phiếu sẽ bị hủy tự động.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 20px 0;">
            Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi. Cảm ơn bạn đã chọn chúng tôi!
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Email này được gửi tự động. Vui lòng không trả lời email này.
            </p>
          </div>
          
        </div>
      </div>
    `,
  };
};

/**
 * Gửi email yêu cầu thanh toán cọc
 */
export const sendDepositPaymentRequest = async (customerEmail, customerName, deposit, room) => {
  try {
    // Wait for nodemailer to be ready (up to 5 seconds)
    let attempts = 0;
    while (!nodemailer && attempts < 50) {
      console.log(`⏳ Waiting for nodemailer to load (${attempts + 1}/50)...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!nodemailer) {
      console.error('❌ Email service not available. Nodemailer failed to load after timeout.');
      return {
        success: false,
        message: 'Email service not configured. Nodemailer not loaded.',
        error: 'Nodemailer initialization timeout',
      };
    }

    const transporter = getTransporter();
    if (!transporter) {
      throw new Error('Email transporter not initialized - check .env configuration');
    }

    // Validate customer email
    if (!customerEmail || !customerEmail.includes('@')) {
      throw new Error(`Invalid customer email: ${customerEmail}`);
    }

    const deadline = new Date(deposit.hanThanhToan);
    const deadlineStr = deadline.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const emailData = depositPaymentEmailTemplate(
      customerName,
      deposit.maPC,
      room?.tenPhong || 'N/A',
      parseInt(deposit.tienCoc),
      deadlineStr
    );

    console.log(`📧 Sending payment request email to ${customerEmail} (${customerName}, Phiếu: ${deposit.maPC})`);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@homestay.com',
      to: customerEmail,
      subject: emailData.subject,
      html: emailData.html,
    });

    console.log(`✓ Email sent successfully. Message ID: ${info.messageId}`);

    return {
      success: true,
      message: 'Email thanh toán đã được gửi thành công',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('Stack:', error.stack);
    return {
      success: false,
      message: 'Lỗi gửi email: ' + error.message,
      error: error.message,
    };
  }
};

/**
 * Gửi email thông báo thanh toán được xác nhận
 */
export const sendPaymentConfirmationEmail = async (customerEmail, customerName, deposit, room) => {
  try {
    // Wait for nodemailer to be ready (up to 5 seconds)
    let attempts = 0;
    while (!nodemailer && attempts < 50) {
      console.log(`⏳ Waiting for nodemailer to load (${attempts + 1}/50)...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!nodemailer) {
      console.error('❌ Email service not available. Nodemailer failed to load after timeout.');
      return {
        success: false,
        message: 'Email service not configured. Nodemailer not loaded.',
        error: 'Nodemailer initialization timeout',
      };
    }

    const transporter = getTransporter();
    if (!transporter) {
      throw new Error('Email transporter not initialized - check .env configuration');
    }

    // Validate customer email
    if (!customerEmail || !customerEmail.includes('@')) {
      throw new Error(`Invalid customer email: ${customerEmail}`);
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #059669; font-size: 24px; margin-top: 0;">✓ Thanh toán xác nhận</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Chào ${customerName},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Thanh toán cọc của bạn đã được xác nhận. Phòng ${room?.tenPhong || 'N/A'} hiện đã được đặt cho bạn.
          </p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #065f46; font-weight: bold;">Mã phiếu: ${deposit.maPC}</p>
            <p style="margin: 5px 0 0 0; color: #088652;">Số tiền: ${parseInt(deposit.tienCoc).toLocaleString('vi-VN')} đ</p>
          </div>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Cảm ơn bạn!</p>
        </div>
      </div>
    `;

    console.log(`📧 Sending confirmation email to ${customerEmail} (${customerName}, Phiếu: ${deposit.maPC})`);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@homestay.com',
      to: customerEmail,
      subject: `Xác nhận thanh toán cọc - Mã phiếu ${deposit.maPC}`,
      html: htmlContent,
    });

    console.log(`✓ Confirmation email sent successfully. Message ID: ${info.messageId}`);

    return {
      success: true,
      message: 'Email xác nhận thanh toán đã được gửi',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.message);
    console.error('Stack:', error.stack);
    return {
      success: false,
      message: 'Lỗi gửi email xác nhận: ' + error.message,
      error: error.message,
    };
  }
};

/**
 * Gửi email xác nhận lịch hẹn xem phòng
 */
export const sendAppointmentConfirmationEmail = async (customerEmail, customerName, appointment, request) => {
  try {
    // Wait for nodemailer to be ready (up to 5 seconds)
    let attempts = 0;
    while (!nodemailer && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!nodemailer) {
      return {
        success: false,
        message: 'Email service not configured. Nodemailer not loaded.',
        error: 'Nodemailer initialization timeout',
      };
    }

    const transporter = getTransporter();
    if (!transporter) {
      throw new Error('Email transporter not initialized - check .env configuration');
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      throw new Error(`Invalid customer email: ${customerEmail}`);
    }

    const appointmentDate = new Date(appointment.ngayHen).toLocaleDateString('vi-VN');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1e3a8a; font-size: 24px; margin-top: 0;">Xác nhận lịch hẹn xem phòng</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Chào ${customerName},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Lịch hẹn xem phòng của bạn đã được tạo thành công.
          </p>
          <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #1e3a8a; width: 35%;">Mã lịch hẹn:</td>
                <td style="padding: 8px; color: #374151;">${appointment.maLH}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold; color: #1e3a8a;">Ngày hẹn:</td>
                <td style="padding: 8px; color: #374151;">${appointmentDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #1e3a8a;">Giờ hẹn:</td>
                <td style="padding: 8px; color: #374151;">${appointment.gioHen}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold; color: #1e3a8a;">Khu vực:</td>
                <td style="padding: 8px; color: #374151;">${request.khuVuc || 'Chưa cập nhật'}</td>
              </tr>
            </table>
          </div>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
            Nếu có thay đổi lịch hẹn, vui lòng liên hệ sớm để được hỗ trợ.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@homestay.com',
      to: customerEmail,
      subject: `Xác nhận lịch hẹn xem phòng - ${appointment.maLH}`,
      html: htmlContent,
    });

    return {
      success: true,
      message: 'Email xác nhận lịch hẹn đã được gửi',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending appointment confirmation email:', error.message);
    return {
      success: false,
      message: 'Lỗi gửi email xác nhận lịch hẹn: ' + error.message,
      error: error.message,
    };
  }
};

export default {
  sendDepositPaymentRequest,
  sendPaymentConfirmationEmail,
  sendAppointmentConfirmationEmail,
};
