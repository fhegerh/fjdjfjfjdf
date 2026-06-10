const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tts2",
    alias: ["texttospeech", "speak", "voice"],
    desc: "Convert text into an AI voice note.",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // Checking if text is provided
        if (!q) return reply("❌ Please provide some text to convert into speech!\n\n*Example:* .tts Hello, welcome to DR KAMRAN bot.");

        // Temporary loading message
        await reply("⏳ Converting text to speech, please wait...");

        // API URL setup
        const apiUrl = `https://api.princetechn.com/api/ai/tts?apikey=prince&text=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl);
        let data = response.data;

        // Forcefully parsing string to JSON if API doesn't send correct headers
        if (typeof data === 'string') {
            try { 
                data = JSON.parse(data); 
            } catch (e) { 
                // If it's a direct URL string instead of JSON object
            }
        }

        // Dynamically searching for the audio link in common API formats
        let audioUrl = null;
        if (typeof data === 'string' && data.startsWith('http')) {
            audioUrl = data;
        } else if (data) {
            audioUrl = data.result?.url || data.result || data.downloadUrl || data.link || data.url;
        }

        // If no link found
        if (!audioUrl || typeof audioUrl !== 'string') {
            return reply("❌ Failed to generate speech. The API structure changed or key expired.");
        }

        // Sending the audio as a WhatsApp Voice Note (PTT)
        return await conn.sendMessage(from, { 
            audio: { url: audioUrl }, 
            mimetype: 'audio/mp4', 
            ptt: false // true means it will send as a normal blue-mic voice note
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ TTS Conversion error: ${error.message}`);
    }
});
                         
