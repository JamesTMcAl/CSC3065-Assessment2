import axios from "axios";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const isCI = process.env.CI === 'true'; // Define isCI based on an environment variable

// Validate necessary environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[ERROR]: Missing email configuration (EMAIL_USER or EMAIL_PASS).");
    process.exit(1);
}

// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const expectedResponses = {
    wordcount: { error: false, string: "Contains 1 words", answer: 1 },
    palindrome: { palindrome_count: 1, text: "racecar" },
    charcount: { error: false, string: "Contains 4 characters.", answer: 4 },
    vowelcount: { text: "hello", vowelCount: 2 },
    commacount: { commaCount: 0 },
    uppercase: { error: false, text: "HELLO", uppercase_count: 5 }
};

// Health check function (only declare here)
export async function checkServiceHealth(config) {
    for (const [service, url] of Object.entries(config.routes)) {
        const startTime = Date.now();
        try {
            const response = await checkServiceWithRetry(url);
            const latency = Date.now() - startTime;

            // Validate correctness with partial validation
            const expected = expectedResponses[service];
            let isCorrect = true;

            // Ensure the response matches the expected values
            if (expected && !validateResponse(response.data, expected)) {
                isCorrect = false;
                sendAlert(service, `Incorrect response from ${service}. Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(response.data)}`);
            }

            // Update service status
            healthStatus[service] = {
                status: isCorrect ? "Up" : "Incorrect",
                latency: `${latency}ms`,
                lastResponse: response.data,
            };
        } catch (error) {
            const status = error.response ? error.response.status : "No response";
            const errorMessage = error.response ? error.response.data : error.message;

            // Log service as down and send alert
            healthStatus[service] = {
                status: "Down",
                latency: "N/A",
                lastResponse: `Error: ${status} - ${errorMessage}`,
            };
            sendAlert(service, `Service ${service} is down! Status: ${status}, Error: ${errorMessage}`);
        }
    }
}

// Retry health check function
async function checkServiceWithRetry(url, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url);
        } catch (error) {
            if (i < retries - 1) {
                await new Promise((res) => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
}

// Partial validation function
function validateResponse(actual, expected) {
    for (let key of Object.keys(expected)) {
        if (!(key in actual)) {
            return false; // Expected key is missing
        }
        if (typeof actual[key] !== typeof expected[key]) {
            return false; // Type mismatch
        }
        if (actual[key] !== expected[key]) {
            return false; // Value mismatch
        }
    }
    return true; // All checks passed
}

// Service health status
const healthStatus = {};
const lastAlertTime = {}; // To track the last alert time for each service

// Cooldown period in milliseconds (e.g., 1 minute)
const ALERT_COOLDOWN_PERIOD = 60000;

function shouldSendAlert(service) {
    const now = Date.now();
    if (!lastAlertTime[service] || now - lastAlertTime[service] > ALERT_COOLDOWN_PERIOD) {
        lastAlertTime[service] = now;
        return true;
    }
    return false;
}

async function sendEmailAlert(subject, message) {
    if (isCI) {
        console.log(`[CI] Email alert suppressed: ${subject} - ${message}`);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email
        to: "jmcalinden08@qub.ac.uk", // Recipient email
        subject: subject,
        text: message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT]: ${subject}`);
    } catch (error) {
        console.error(`[EMAIL FAILED]: ${error.message}`);
    }
}

function sendAlert(service, message) {
    if (shouldSendAlert(service)) {
        console.log(`[ALERT]: ${message}`);
        sendEmailAlert("Service Alert", message);
    } else {
        console.log(`[ALERT SUPPRESSED]: ${message}`);
    }
}

export function getHealthStatus() {
    return healthStatus;
}
