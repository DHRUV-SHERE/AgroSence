// emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",  // or your email provider
  auth: {
    user: "workwithdhruv05@gmail.com",           // replace with your email
    pass: "kypr mujj dkol qtpb",        // replace with your app password or email password
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: '"AgroSence" <workwithdhruv05@gmail.com>', // sender address
    to: email, // receiver email
    subject: "Your OTP for Password Reset",
    html: `<p>Your OTP for password reset is: <b>${otp}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
  console.log("OTP Email sent to:", email);
};

module.exports = { sendOTPEmail };
