import nodemailer from "nodemailer";

/**
 * EMAIL TRANSPORTER
 */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,

    secure:
        process.env.SMTP_SECURE === "true",

    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
});

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);

export const verifyEmailConnection = async () => {
    try {
        await transporter.verify();

        console.log("Email service connected");

        return true;

    } catch (error) {
        console.error("Email service error", error.message);

        return false;
    }
};

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
}) => {
    if (!to || !subject) {
        throw new Error("Recipient and subject are required");
    }

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
    if (!from) {
        throw new Error("EMAIL_FROM or SMTP_USER must be configured");
    }

    const mail = await transporter.sendMail({
        from,

        to,

        subject,

        text,

        html,
    });

    return mail;
}


export const sendWelcomeEmail = async ({
    name,
    email,
}) => {
    const safeName = escapeHtml(name);
    return await sendEmail({
        to: email,

        subject: "WELCOME to BizFlow",

        text: `HELLO ${name},

        Welcome to BizFlow.
        
        Your Account has been successfully created.
        
        Thank you,
        BizFlow Team`,

        html: `
        <div style="font-family: Arial, sans-serif;">
            <h2>Welcome to BizFlow</h2>

        <p>Hello <strong>${safeName}</strong>,</p>

        <p>
          Your BizFlow account has been successfully created.
        </p>

        <p>
          You can now log in and access your dashboard.
        </p>

        <br />

        <p>
          Thank you,<br />
          <strong>BizFlow Team</strong>
        </p>
      </div>
        `,
    });
};


export const sendPasswordResetEmail = async ({
    name,
    email,
    resetLink,
}) => {
    const safeName = escapeHtml(name);
    let safeResetLink;
    try {
        const url = new URL(resetLink);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
            throw new Error("Reset link must use HTTP or HTTPS");
        }
        safeResetLink = escapeHtml(url.href);
    } catch {
        throw new Error("A valid HTTP or HTTPS reset link is required");
    }
    return await sendEmail({
        to: email,

        subject: "Reset your BizFlow password",

        text: `Hello ${name},

You requested a password reset.

Reset your password using this link:

${resetLink}

If you did not request this, please ignore this email.

BizFlow Team`,

        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset</h2>

        <p>Hello <strong>${safeName}</strong>,</p>

        <p>
          You requested a password reset for your
          BizFlow account.
        </p>

        <p>
          <a href="${safeResetLink}">
            Reset Password
          </a>
        </p>

        <p>
          If you did not request this, you can safely
          ignore this email.
        </p>

        <br />

        <p>BizFlow Team</p>
      </div>
    `,
    });
}


export const sendTaskAssignment = async ({
    name,
    email,
    taskTitle,
    dueDate,
}) => {
    const safeName = escapeHtml(name);
    const safeTaskTitle = escapeHtml(taskTitle);
    const safeDueDate = dueDate
      ? escapeHtml(new Date(dueDate).toLocaleDateString())
      : "Not specified";
    return await sendEmail({
         to: email,

    subject: "New Task Assigned",

    text: `Hello ${name},

A new task has been assigned to you.

Task: ${taskTitle}

Due Date: ${safeDueDate}

Please log in to BizFlow to view the task.

BizFlow Team`,

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Task Assigned 📋</h2>

        <p>Hello <strong>${safeName}</strong>,</p>

        <p>A new task has been assigned to you.</p>

        <p>
          <strong>Task:</strong> ${safeTaskTitle}
        </p>

        <p>
          <strong>Due Date:</strong>
          ${safeDueDate}
        </p>

        <p>
          Please log in to BizFlow to view the
          complete task details.
        </p>

        <p>BizFlow Team</p>
      </div>
    `,
  });
}