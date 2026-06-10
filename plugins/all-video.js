const { cmd } = require('../command');
const axios = require('axios');

const BASE_URL = "https://react-channelwa.vercel.app/api";

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
];

let usedUAs = [];

// Helper functions from your source script
function getRandomUA() {
    let available = USER_AGENTS.filter(ua => !usedUAs.includes(ua));
    if (available.length === 0) {
        usedUAs = [];
        available = USER_AGENTS;
    }
    const random = available[Math.floor(Math.random() * available.length)];
    usedUAs.push(random);
    return random;
}

function formatEmojis(emojiInput) {
    if (emojiInput.includes(',')) return emojiInput;
    const emojiRegex = /[\p{Emoji}\uFE0F\u20E3]/gu;
    const matches = emojiInput.match(emojiRegex);
    if (matches && matches.length > 0) {
        return matches.join(',');
    }
    return emojiInput;
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCsrfToken(retry = 3) {
    for (let i = 0; i < retry; i++) {
        try {
            const response = await axios.get(`${BASE_URL}/csrf-token`, {
                timeout: 10000,
                headers: { 'User-Agent': getRandomUA(), 'Referer': 'https://react-channelwa.vercel.app/' }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                const resetTime = error.response.headers['ratelimit-reset'] || 2;
                await delay(resetTime * 1000);
            } else if (i < retry - 1) {
                await delay(2000);
            } else {
                throw error;
            }
        }
    }
}

async function registerDevice(deviceId, sessionId, retry = 3) {
    for (let i = 0; i < retry; i++) {
        try {
            const response = await axios.post(`${BASE_URL}/register-device`, { deviceId }, { 
                headers: { 'Content-Type': 'application/json', 'X-Session-Id': sessionId, 'User-Agent': getRandomUA() },
                timeout: 15000
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                const resetTime = error.response.headers['ratelimit-reset'] || 2;
                await delay(resetTime * 1000);
            } else if (i < retry - 1) {
                await delay(2000);
            } else {
                throw error;
            }
        }
    }
}

async function sendReaction(deviceKey, url, emojis, csrfToken, sessionId, retry = 3) {
    for (let i = 0; i < retry; i++) {
        try {
            const response = await axios.post(`${BASE_URL}/inject`, { deviceKey, url, emojis, csrfToken, sessionId }, { 
                headers: { 'Content-Type': 'application/json', 'X-Session-Id': sessionId, 'User-Agent': getRandomUA() },
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                const resetTime = error.response.headers['ratelimit-reset'] || 2;
                await delay(resetTime * 1000);
            } else if (i < retry - 1) {
                await delay(2000);
            } else {
                throw error;
            }
        }
    }
}

// Main Command Definition
cmd({
    pattern: "wareact",
    alias: ["reactch", "chreact2", "channelreact"],
    desc: "Send auto reactions to a WhatsApp Channel link.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        const url = args[0];
        // Collect everything after the URL as potential emojis
        const emojisRaw = args.slice(1).join(" ") || "🔥,✨,☝️";

        if (!url) {
            return reply("❌ Please provide a WhatsApp Channel URL!\n\n*Usage:* .wareact [Channel_URL] [Emojis]\n*Example:* .wareact https://whatsapp.com/channel/xxx 🥰🔥");
        }

        await reply("⏳ Initializing connection to reaction gateway... Please wait.");

        const emojis = formatEmojis(emojisRaw);
        
        // 1. Fetching Security Session and CSRF Token
        const tokenData = await getCsrfToken();
        if (!tokenData || !tokenData.token || !tokenData.sessionId) {
            return reply("❌ Failed to secure session tokens from the reaction gateway.");
        }
        const { token: csrfToken, sessionId } = tokenData;
        
        // 2. Registering Virtual Device Sandbox
        const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const register = await registerDevice(deviceId, sessionId);
        
        if (!register || !register.success || !register.deviceKey) {
            return reply("❌ Device authentication sandbox failed to register.");
        }

        // 3. Spawning Reaction Injector Payload
        const result = await sendReaction(register.deviceKey, url, emojis, csrfToken, sessionId);
        
        if (!result || !result.success) {
            return reply(`❌ injection sequence stopped: ${result.message || 'Unknown error'}`);
        }

        // Filtering logs for successful counts
        const successDetails = (result.details || []).filter(d => d.includes('berhasil'));
        
        // Final Output layout
        let txt = `🚀 *CHANNEL REACTION DISPATCHED* 🚀\n\n`;
        txt += `📌 *Status:* ${result.message || 'Success'}\n`;
        txt += `🎭 *Emojis Sent:* ${emojis}\n`;
        txt += `📊 *Success Batches:* ${successDetails.length}\n\n`;
        txt += `*Powered by DR KAMRAN*`;

        return await reply(txt);

    } catch (error) {
        console.error(error);
        return reply(`❌ System Failure: ${error.message}`);
    }
});
