import express from 'express';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Initialize Express
const app = express();

// Setup multer storage
const uploadDir = path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'career@spotcommglobal.com',
        pass: 'Career123456789.'
    }
});

// Define the serverless function
export default async function handler(req, res) {
    if (req.method === 'POST') {
        upload.single('cv')(req, res, (err) => {
            if (err) {
                console.error("File upload error:", err);
                return res.status(400).json({ message: 'Error uploading file' });
            }

            const { fullName, email, contact, jobTitle, linkedIn } = req.body;
            const cv = req.file;

            if (!cv) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const mailOptions = {
                from: 'career@spotcommglobal.com',
                to: 'career@spotcommglobal.com',
                subject: `New Job Application for ${jobTitle || 'Job Position'}`,
                text: `
                    Full Name: ${fullName || 'Not provided'}
                    Email: ${email || 'Not provided'}
                    Contact: ${contact || 'Not provided'}
                    LinkedIn: ${linkedIn || 'Not provided'}
                    Job Applied: ${jobTitle || 'Not specified'}
                    CV: Attached file
                `,
                attachments: [
                    {
                        filename: cv.originalname,
                        path: cv.path,
                    },
                ],
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Error sending email' });
                }
                return res.status(200).json({ message: 'Email sent successfully' });
            });
        });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
