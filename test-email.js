const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  auth: {
    user: "davidakintunde433@gmail.com",
    pass: "ywpnygqnxincjjdb", // 👈 Make sure no space
  },
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: "davidakintunde433@gmail.com",
      to: "davidakintunde433@gmail.com",
      subject: "Test Email",
      text: "This is a test email!",
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
}

sendTestEmail();