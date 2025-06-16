const nodemailer = require("nodemailer");

// cau hinh email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

//template mail
const creteCompletionEmailTemplate = (donorName, nextDonationDate) => {
  const formattedDate = new Date(nextDonationDate).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    subject: "🩸 Cảm ơn bạn đã hiến máu - Thông tin quan trọng",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc3545; margin-bottom: 10px;">🩸 Cảm ơn bạn đã hiến máu!</h1>
            <p style="color: #666; font-size: 16px;">Hành động cao đẹp của bạn đã cứu được nhiều sinh mạng</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-top: 0;">Chào ${donorName},</h3>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              Chúng tôi xin chân thành cảm ơn bạn đã tham gia hiến máu ngày hôm nay. 
              Hành động cao đẹp của bạn sẽ giúp cứu được nhiều sinh mạng quý báu.
            </p>
          </div>

          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin-top: 0;">📋 Lưu ý quan trọng sau khi hiến máu:</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li>Nghỉ ngơi 10-15 phút tại chỗ trước khi rời đi</li>
              <li>Uống nhiều nước (2-3 lít trong 24h tới)</li>
              <li>Ăn đầy đủ dinh dưỡng, bổ sung sắt</li>
              <li>Tránh vận động mạnh trong 24h</li>
              <li>Không nâng vật nặng bằng tay đã hiến máu</li>
              <li>Nếu cảm thấy chóng mặt, hãy ngồi nghỉ ngay</li>
            </ul>
          </div>

          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <h3 style="color: #2e7d32; margin-top: 0;">📅 Lịch hiến máu tiếp theo</h3>
            <p style="color: #555; font-size: 18px; margin-bottom: 10px;">
              Bạn có thể hiến máu lần tiếp theo vào:
            </p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; display: inline-block;">
              <strong style="color: #2e7d32; font-size: 20px;">${formattedDate}</strong>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Mọi thắc mắc xin liên hệ: <br>
              📞 Hotline: 1900-xxxx <br>
              📧 Email: support@blooddonation.com
            </p>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              Cảm ơn bạn đã là một phần của cộng đồng hiến máu tình nguyện! ❤️
            </p>
          </div>
        </div>
      </div>
    `,
  };
};

//gui mail
const sendMail = async (donorEmail, donorName, nextDonationDate) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = creteCompletionEmailTemplate(
      donorName,
      nextDonationDate
    );

    const mailOptions = {
      from: `"Trung tâm Hiến Máu Nhân Đạo" <${process.env.EMAIL_USER}>`,
      to: donorEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending mail", error);
    throw new Error("Failed to send mail" + error.message);
  }
};

module.exports = { sendMail };
