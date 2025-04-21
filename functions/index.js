const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// ✅ แบบ secret (ต้องตั้งไว้แล้วใน firebase)
const gmailEmail = process.env.GMAIL_EMAIL;
const gmailPassword = process.env.GMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendInviteEmail = functions
  .runWith({ secrets: ["GMAIL_EMAIL", "GMAIL_PASSWORD"] }) // ✅ ต้องตรงกับที่ตั้ง secret
  .https.onCall(async (data, context) => {
    const { email, name, inviteLink } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "คุณต้องเข้าสู่ระบบก่อนส่งคำเชิญ"
      );
    }

    const mailOptions = {
      from: `Streamwash Dashboard <${gmailEmail}>`,
      to: email,
      subject: "📩 คำเชิญเข้าใช้งานระบบแดชบอร์ด",
      html: `
        <p>สวัสดีคุณ <strong>${name || "ผู้ใช้งานใหม่"}</strong>,</p>
        <p>คุณได้รับคำเชิญให้เข้าร่วมระบบแดชบอร์ดของบริษัท Streamwash.</p>
        <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อเข้าสู่ระบบ:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <br/>
        <p>ขอบคุณครับ/ค่ะ</p>
        <p>ทีมงาน Streamwash</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw new functions.https.HttpsError("internal", "ไม่สามารถส่งอีเมลได้");
    }
  });
