const nodemailer = require('nodemailer')
const google = require('googleapis').google
const dotenv = require('dotenv')

// ================= load env ver ================= //
dotenv.config({ path: '../config/config.env' })

const CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET
const REDIRECT_URL = process.env.GMAIL_OAUTH_REDIRECT_URL
const REFRESH_TOKEN = process.env.GMAIL_OAUTH_REFRESH_TOKEN
const USER = process.env.GMAIL_OAUTH_EMAIL_USERNAME

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
)

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN  })

// ================= Gmail message service middleware ================= //
const sendEmail = async (options) => {
    const acces_token = await oAuth2Client.getAccessToken()

    const transport = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: acces_token
            }
        }
    )

    const message_options = {
        from: `${process.env.GMAIL_OAUTH_FROM_NAME} ${process.env.GMAIL_OAUTH_EMAIL_USERNAME}`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    await transport.sendMail(message_options)
}

module.exports = { sendEmail }