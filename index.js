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
app.get('/home', (req, res) => {
    res.status(200).json('Welcome, your app is working well');
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// const express = require("express");
// const mysql = require("mysql2");
// const cors = require("cors");

// const app = express();
// app.use(cors());

// // Database connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "wglenn",
//   password: "P0pc0rn182!",
//   database: "CYAN",
// });

// // Route to get settings data (Last Updated value)
// app.get("/settings", (req, res) => {
//   db.query("SELECT DBValue FROM Settings WHERE id = 3", (err, result) => {
//     if (err) {
//       console.error("Error fetching settings:", err);
//       res.status(500).send("Error fetching settings");
//     } else {
//       res.json(result[0]);
//     }
//   });
// });

// // Route to get backhauls data
// app.get("/backhauls", (req, res) => {
//   db.query("SELECT * FROM Backhauls ORDER BY Name", (err, result) => {
//     if (err) {
//       console.error("Error fetching backhauls:", err);
//       res.status(500).send("Error fetching backhauls");
//     } else {
//       res.json(result);
//     }
//   });
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });