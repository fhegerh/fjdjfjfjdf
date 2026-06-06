// plugins/mention.js - CommonJS Version
const { cmd } = require('../command');
const config = require('../config');
const converter = require('../lib/converter');
const path = require('path');
const axios = require('axios');

// VoiceClip urls
const voiceClips = [
    'https://files.catbox.moe/tuueyw.mp3',
    'https://files.catbox.moe/pw4yuu.mp3',
    'https://files.catbox.moe/q56rza.mp3',
    'https://files.catbox.moe/ldrebe.mp3',
    'https://files.catbox.moe/cpjqjd.mp3',
    'https://files.catbox.moe/v5c4fd.mp3',
    'https://files.catbox.moe/naub62.mp3',
    'https://files.catbox.moe/ez7wvh.mp3',
    'https://files.catbox.moe/3ruryr.mp3',
    'https://files.catbox.moe/hk2fjw.mp3',
    'https://files.catbox.moe/hk2fjw.mp3',
    'https://files.catbox.moe/pvymqf.mp3',
    'https://files.catbox.moe/md2jm5.mp3',
    'https://files.catbox.moe/ypx92a.mp3',
    'https://files.catbox.moe/7tv2do.mp3',
    'https://files.catbox.moe/sr8k3y.mp3'
];

// Fixed delay of 3 seconds
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch audio buffer
async function fetchAudioBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Error fetching audio:', error);
        throw error;
    }
}

// 1. Auto reply when bot is mentioned in group
cmd({
    on: "body"
}, async (conn, m, store, { isGroup, botNumber2, userConfig }) => {
    try {
        const mek = m.mek || m;
        if (mek.key?.fromMe) return;

        // Get MENTION_REPLY from userConfig if available, otherwise use config.MENTION_REPLY
        const MENTION_REPLY = userConfig?.MENTION_REPLY || config.MENTION_REPLY || 'false';
        
        if (MENTION_REPLY !== 'true' || !isGroup || !botNumber2) return;

        const mentioned = m.mentionedJid || [];
        if (!mentioned.includes(botNumber2)) return;

        const chatId = m.chat;

        // Show recording animation
        await conn.sendPresenceUpdate('recording', chatId);

        // Select random clip
        const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

        // Fetch audio using axios
        const audioBuffer = await fetchAudioBuffer(randomClip);

        // Fixed 3-second delay before converting
        await delay(3000);

        // Convert to PTT if converter function exists
        let pttAudio;
        if (typeof converter.toPTT === 'function') {
            pttAudio = await converter.toPTT(audioBuffer, 'mp3');
        } else if (typeof converter === 'function') {
            pttAudio = await converter(audioBuffer, 'mp3');
        } else {
            pttAudio = audioBuffer;
        }

        // Send voice note
        await conn.sendMessage(chatId, {
            audio: pttAudio,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m });

    } catch (e) {
        console.error('Error in mention reply:', e);
    }
});

// 2. Command: .mee / .me
cmd({
    pattern: "mee",
    alias: ["me"],
    desc: "Send a random voice message",
    category: "other",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, reply, userConfig }) => {
    try {
        const chatId = from;

        // Show recording animation
        await conn.sendPresenceUpdate('recording', chatId);

        // Select random clip
        const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

        // Fetch audio using axios
        const audioBuffer = await fetchAudioBuffer(randomClip);

        // Fixed 3-second delay before converting
        await delay(3000);

        // Convert to PTT if converter function exists
        let pttAudio;
        if (typeof converter.toPTT === 'function') {
            pttAudio = await converter.toPTT(audioBuffer, 'mp3');
        } else if (typeof converter === 'function') {
            pttAudio = await converter(audioBuffer, 'mp3');
        } else {
            pttAudio = audioBuffer;
        }

        // Send voice note
        await conn.sendMessage(chatId, {
            audio: pttAudio,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m });

    } catch (e) {
        console.error('Error in mention command:', e);
        await reply(`❌ Error: ${e.message}`);
    }
});
