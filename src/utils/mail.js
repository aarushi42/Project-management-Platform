import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

//sending the email(method)
const sendEmail = async (options) => {
  // putting branding from mailgen
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Project Management Platform",
      link: "https://www.projectmanagementplatform.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHTML = mailGenerator.generate(options.mailgenContent);

  //creating transporter for sending the email using nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  // creating the mail
  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHTML,
  };

  // sending the email
  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

//Prepare the email
const emailVerificationMailgenContent = (username, verificationToken) => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to our project management platform! We're excited to have you on board.",
      action: {
        instructions:
          "To get started, please verify your email address by clicking the button below:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify Email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to hear from you.",
    },
  };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro:
        "We got a request to reset the password provided for your account. If you didn't request a password reset, you can safely ignore this email.",
      action: {
        instructions: "To reset your password, please click the button below:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to hear from you.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
