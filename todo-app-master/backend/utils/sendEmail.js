import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (host) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: user && pass ? { user, pass } : undefined,
        });
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: user && pass ? { user, pass } : undefined,
    });
};

export const sendEmail = async (to, subject, text) => {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || "no-reply@daymark.local";

    await transporter.sendMail({
        from,
        to,
        subject,
        text,
    });
};
