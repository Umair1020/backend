const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
app.use(cors());
app.use(bodyParser.json());


// Define the path for the uploads directory
const uploadDir = path.join(__dirname, 'uploads');

// Check if the directory exists, and if not, create it
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

// Configure your Hostinger SMTP credentials here
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'career@spotcommglobal.com',
        pass: 'Career123456789.'
    }
});

app.post('/send-email', upload.single('cv'), (req, res) => {
    const { fullName, email, contact, jobTitle, linkedIn } = req.body;
    const cv = req.file;

    // Check if the file was uploaded successfully
    if (!cv) {
        console.error("No file uploaded");
        return res.status(400).send('Error: No file uploaded');
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
                path: cv.path,  // Access the file's path directly from multer's output
            },
        ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error sending email');
        }
        res.status(200).send('Email sent successfully');
    });
});


app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
