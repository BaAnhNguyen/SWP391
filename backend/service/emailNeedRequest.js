const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Hàm build bảng các túi máu
function buildAssignedUnitsTable(units) {
  return `
    <table border="1" cellpadding="6" style="border-collapse: collapse; margin: 12px 0; font-size: 15px;">
      <thead style="background: #f2f2f2;">
        <tr>
          <th>STT</th>
          <th>Nhóm máu</th>
          <th>Thành phần</th>
          <th>Thể tích (ml)</th>
          <th>Hạn sử dụng</th>
        </tr>
      </thead>
      <tbody>
        ${units
          .map(
            (u, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${u.BloodType}</td>
            <td>${u.ComponentType}</td>
            <td>${u.Volume || "-"}</td>
            <td>${
              u.DateExpired
                ? new Date(u.DateExpired).toLocaleDateString("vi-VN")
                : "-"
            }</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

// Hàm tạo template email nhận máu
function getAppointmentMail(memberName, appointmentDate, units) {
  const formattedDate = appointmentDate
    ? new Date(appointmentDate).toLocaleString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "(chưa xác định)";
  return {
    subject: "🩸 Thông báo nhận máu – Đơn yêu cầu của bạn đã được phân phối",
    html: `
      <div style="font-family: Arial,sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #d32f2f;">Thông báo nhận máu thành công</h2>
        <p>Chào <b>${memberName}</b>,</p>
        <p>Yêu cầu nhận máu của bạn đã được xác nhận và phân phối thành công.</p>
        <p><b>Ngày hẹn nhận máu:</b> <span style="color: #1976d2;">${formattedDate}</span></p>
        <p><b>Thông tin túi máu được phân phối:</b></p>
        ${buildAssignedUnitsTable(units)}
        <p>Vui lòng mang giấy tờ tùy thân và đến đúng giờ để được phục vụ tốt nhất!</p>
        <hr>
        <p style="color: #888; font-size: 13px;">
          Mọi thắc mắc vui lòng liên hệ: <b>support@blooddonation.com</b>
        </p>
      </div>
    `,
  };
}

// Hàm gửi mail
async function sendMail(to, subject, html) {
  const mailOptions = {
    from: `"Trung tâm Hiến Máu" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { getAppointmentMail, sendMail, buildAssignedUnitsTable };
