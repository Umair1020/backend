const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for file uploads
const uploadDir = path.join(__dirname, '/tmp/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        upload.single('cv')(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ error: 'File upload error' });
            }

            const { fullName, email, contact, jobTitle, linkedIn } = req.body;
            const cv = req.file;

            if (!cv) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const transporter = nodemailer.createTransport({
                host: 'smtp.hostinger.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'career@spotcommglobal.com',
                    pass: 'Career123456789.',
                },
            });

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
                `,
                attachments: [
                    {
                        filename: cv.originalname,
                        path: cv.path,
                    },
                ],
            };

            try {
                await transporter.sendMail(mailOptions);
                return res.status(200).json({ message: 'Email sent successfully' });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error sending email' });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
