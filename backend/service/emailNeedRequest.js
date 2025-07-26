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

//gui xac nhan hien mau
function getInviteDonorMail(donorName, patientName, bloodGroup, component) {
  //URL
  let registerURL = `${process.env.CLIENT_BASE_URL}/donate`;

  //prefill
  if (bloodGroup || component) {
    const params = [];
    if (bloodGroup) params.push(`bloodGroup=${encodeURIComponent(bloodGroup)}`);
    if (component) params.push(`component=${encodeURIComponent(component)}`);
    registerURL += "?" + params.join("&");
  }
  return {
    subject: "Lời mời đăng ký hiến máu từ hệ thống",
    html: `
      <div style="font-family: Arial,sans-serif;max-width:600px">
        <h2>Lời mời đăng ký hiến máu từ hệ thống</h2>
        <p>Chào <b>${donorName}</b>,</p>
        <p>
          Trung tâm phát hiện có người cần máu nhóm <b>${bloodGroup || ""}</b>
          ${component ? `(${component})` : ""}${
      patientName ? ` – <b>${patientName}</b>` : ""
    }.
        </p>
        <p>
          Nếu bạn sẵn sàng giúp đỡ, vui lòng đăng ký hiến máu tại:
          <br>
          <a href="${registerURL}" style="display:inline-block;padding:12px 24px;background:#2ecc40;color:white;text-decoration:none;font-weight:bold;border-radius:8px;">Đăng ký hiến máu ngay</a>
        </p>
        <p style="color:#888;font-size:13px">
          Nếu không phải bạn, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  };
}

//reject mail
function getRejectionMail(name, reason) {
  return {
    subject: "Đơn yêu cầu nhận máu bị từ chối",
    html: `
      <div style="font-family: Arial,sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #d32f2f;">Đơn bị từ chối</h2>
        <p>Chào <b>${name}</b>,</p>
        <p>Chúng tôi rất tiếc phải thông báo rằng đơn yêu cầu nhận máu của bạn đã bị <strong>từ chối</strong>.</p>
        <p><b>Lý do:</b> ${reason}</p>
        <p>Bạn có thể tạo lại yêu cầu nếu cần thiết.</p>
        <hr>
        <p style="color: #888; font-size: 13px;">Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ: support@blooddonation.com</p>
      </div>
    `,
  };
}

//fulfield mail
function getFulfillmentConfirmationMail(name, requestId) {
  const confirmUrl = `${process.env.CLIENT_BASE_URL}/blood-requests?highlight=${requestId}&tab=view`;

  return {
    subject: "Đã xử lý đơn nhận máu của bạn",
    html: `
      <div style="font-family: Arial,sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2e7d32;">Đơn đã được xử lý thành công</h2>
        <p>Chào <b>${name}</b>,</p>
        <p>Đơn yêu cầu nhận máu của bạn đã được <strong>xử lý thành công</strong>.</p>
        <p>Vui lòng xác nhận đã nhận máu bằng cách truy cập liên kết dưới đây:</p>
        <a href="${confirmUrl}" style="display:inline-block; margin:12px 0; padding:10px 16px; background-color:#1976d2; color:#fff; text-decoration:none; border-radius:4px;">
          Xác nhận đã nhận máu
        </a>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <hr>
        <p style="color: #888; font-size: 13px;">Mọi thắc mắc, vui lòng liên hệ: support@blooddonation.com</p>
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

module.exports = {
  getAppointmentMail,
  sendMail,
  getInviteDonorMail,
  getRejectionMail,
  getFulfillmentConfirmationMail,
};
