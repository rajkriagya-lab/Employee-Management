import nodemailer from "nodemailer";

/**
 * EMAIL TRANSPORTER
 */

const transporter = nodemailer.createTrasporter({
    host: proccess.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,

    secure:
        process.env.SMTP_SECURE === "true",

    auth: {
        user: proccess.env.SMTP_USER,
        pass: proccess.env.SMTP_PASSWORD,
    },
});

/**
 * VERIFY EMAIL CONNECTION
 */

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

    const mail = await transporter.sendMail({
        from:
            proccess.env.EMAIL_FROM ||
            process.env.SMTP_USER,

        to,

        subject,

        text,

        html,
    });

    return mail;
}

/**
 * WELCOME MESSAGE
 */

export const sendWelcomeEmail = async ({
    name,
    email,
}) => {
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

        <p>Hello <strong>${name}</strong>,</p>

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

/**
 * PASSWORD RESET EMAIL
 */

export const sendPasswordResetEmail = async ({
    name,
    email,
    resetLink,
}) => {
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

        <p>Hello <strong>${name}</strong>,</p>

        <p>
          You requested a password reset for your
          BizFlow account.
        </p>

        <p>
          <a href="${resetLink}">
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

/**
 * TASK ASSIGNMENT EMAIL
 */

export const sendTaskAssignment = async ({
    name,
    email,
    taskTitle,
    dueDate,
}) => {
    return await sendEmail({
         to: email,

    subject: `New Task Assigned: ${taskTitle}`,

    text: `Hello ${name},

A new task has been assigned to you.

Task: ${taskTitle}

Due Date: ${
      dueDate
        ? new Date(dueDate).toLocaleDateString()
        : "Not specified"
    }

Please log in to BizFlow to view the task.

BizFlow Team`,

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Task Assigned 📋</h2>

        <p>Hello <strong>${name}</strong>,</p>

        <p>A new task has been assigned to you.</p>

        <p>
          <strong>Task:</strong> ${taskTitle}
        </p>

        <p>
          <strong>Due Date:</strong>
          ${
            dueDate
              ? new Date(
                  dueDate
                ).toLocaleDateString()
              : "Not specified"
          }
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