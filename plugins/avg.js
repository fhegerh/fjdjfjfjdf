const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ytmp35",
    alias: ["yta5", "ytmusic5"],
    category: "downloader",
    filename: __filename,
    description: "Download audio from YouTube",
    use: '.ytmp3 <youtube link>',
},
async (conn, mek, m, { q, reply }) => {
    
    // 1. Link check karein
    if (!q || !q.includes("youtube.com") && !q.includes("youtu.be")) {
        return reply("❌ Please valid YouTube link dein.\n\nExample: .ytmp3 https://youtube.com/watch?v=...");
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: mek.key } });

    try {
        // 2. API URL setup (Aapka diya hua API)
        const apiUrl = `https://api.princetechn.com/api/download/ytmp3?apikey=prince&url=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        // 3. Check karein ki response sahi aaya ya nahi
        // Note: API ka response structure check kar lein, agar 'result' ya 'download_url' hai toh use update karein
        if (data && data.status === 200 || data.result) {
            const audioUrl = data.result.download_url || data.result; // API structure ke hisaab se adjust karein

            await conn.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false, // agar audio file chahiye toh false, voice note ke liye true
                caption: `✅ *Download Successful*\n\n> © KAMRAN-MINI-BOT ッ`
            }, { quoted: mek });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: mek.key } });
        } else {
            throw new Error("API failed to provide a valid URL.");
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: mek.key } });
        reply("❌ Error: " + e.message);
    }
});
