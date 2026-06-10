const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "allio",
    alias: ["aio2", "aio"],
    desc: "Download media using Nanzz AIO API.",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a link!\n\n*Example:* .nz https://www.instagram.com/...");

        await reply("⏳ Processing via Nanzz API, please wait...");

        // Notice the API typo 'donwloader' from your screenshot description
        const apiUrl = `https://api-nanzz.my.id/api/donwloader/all-in-one.php?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);
        let data = response.data;

        if (typeof data === 'string') data = JSON.parse(data);

        // Drilling into Nanzz deep nesting: data.result[0].result[0]
        let mediaData = null;
        if (data && data.status && Array.isArray(data.result)) {
            const firstResult = data.result[0];
            if (firstResult && Array.isArray(firstResult.result)) {
                mediaData = firstResult.result[0];
            }
        }

        if (!mediaData || !mediaData.url) {
            return reply("❌ Media not found or link unsupported by Nanzz API.");
        }

        const downloadUrl = mediaData.url;
        const title = mediaData.title || "Nanzz Downloaded Media";
        const thumbnail = mediaData.thumbnail;

        let captionText = `📥 *KAMRAN DOWNLOADER* 📥\n\n`;
        captionText += `📌 *Title:* ${title}\n`;
        captionText += `🌐 *Source:* ${mediaData.source || "Unknown"}\n\n`;
        captionText += `*Powered by DR KAMRAN*`;

        // Smart delivery based on source type
        const source = (mediaData.source || "").toLowerCase();
        if (source === 'soundcloud') {
            return await conn.sendMessage(from, { audio: { url: downloadUrl }, mimetype: 'audio/mp4', ptt: false }, { quoted: mek });
        }

        return await conn.sendMessage(from, { video: { url: downloadUrl }, caption: captionText }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ Nanzz DL Error: ${error.message}`);
    }
});
