const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");
// const cors = require("cors")({ origin: true });

const gmailEmail = process.env.GMAIL_EMAIL;
const gmailPassword = process.env.GMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// ✅ Gen 2 Function แบบใหม่
exports.sendInviteEmail = onRequest(
  {
    secrets: ["GMAIL_EMAIL", "GMAIL_PASSWORD"],
    cors: true, // ✅ Gen 2 มี CORS ใน config ได้เลย
    region: "us-central1", // ✅ ระบุ region เหมือนเดิม
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { email, name, inviteLink } = req.body;

    const mailOptions = {
      from: `Streamwash Dashboard <${gmailEmail}>`,
      to: email,
      subject: "📩 คำเชิญเข้าใช้งานระบบแดชบอร์ด",
      html: ` <!-- ← แก้ตรงนี้ -->
        <p>คุณได้รับคำเชิญให้เข้าร่วมระบบแดชบอร์ดของ บริษัท สทรีมวอช (ประเทศไทย) จำกัด</p>
        <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันการลงทะเบียน:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" target="_blank" style="
            background-color: #002D8B;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            font-weight: bold;
            border-radius: 8px;
            display: inline-block;
          ">
            ✅ ยืนยันการลงทะเบียน
          </a>
        </p>
        <p>หากคุณไม่ได้ร้องขอการเชิญนี้ กรุณาละเว้นอีเมลนี้</p>
        <p>ขอบคุณครับ/ค่ะ<br/>ทีมงานระบบแดชบอร์ด</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error("❌ Error sending email:", error);
      res.status(500).json({ success: false, message: "ไม่สามารถส่งอีเมลได้" });
    }
  }
);
