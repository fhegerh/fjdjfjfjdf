const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search'); // Yeh library zaruri hai

cmd({
    pattern: "play3",
    alias: ["song3", "music3"],
    category: "downloader",
    filename: __filename,
    description: "Download audio from YouTube using Link or Name",
    use: '.ytmp3 <link or name>',
},
async (conn, mek, m, { q, reply }) => {
    
    if (!q) return reply("❌ Please YouTube link ya song ka naam likhein.");

    await conn.sendMessage(m.chat, { react: { text: "🔍", key: mek.key } });

    try {
        let videoUrl = q;

        // Agar user ne link nahi diya, toh search karein
        if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
            const search = await yts(q);
            if (search.videos.length === 0) return reply("❌ Song nahi mila.");
            videoUrl = search.videos[0].url; // Pehla result utha lein
            await reply(`🎵 *Found:* ${search.videos[0].title}\n⏳ Downloading...`);
        }

        // API Call
        const apiUrl = `https://api.princetechn.com/api/download/ytmp3?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data && (data.status === 200 || data.result)) {
            const audioUrl = data.result.download_url || data.result;

            await conn.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
                caption: `✅ *Download Successful*\n\n> © KAMRAN-MINI-BOT ッ`
            }, { quoted: mek });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: mek.key } });
        } else {
            throw new Error("Download URL nahi mila.");
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: mek.key } });
        reply("❌ Error: " + e.message);
    }
});
