const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "dl",
    alias: ["aio", "download", "allinone"],
    desc: "Download media from TikTok, Instagram, FB, etc. via link.",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // Checking if URL is provided
        if (!q) return reply("❌ Please provide a valid social media link!\n\n*Example:* .dl https://www.instagram.com/reel/...");

        // Simple URL Validation Check
        const isUrl = q.startsWith("http://") || q.startsWith("https://");
        if (!isUrl) return reply("❌ Invalid Link! URL must start with http:// or https://");

        // Temporary loading message
        await reply("⏳ Processing your link, please wait...");

        // API URL setup (Using the link provided by you)
        const apiUrl = `https://api.ikyyxd.my.id/download/all-in-one?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);
        let data = response.data;

        // Forcefully parse to JSON if it comes as a string format
        if (typeof data === 'string') data = JSON.parse(data);

        // Standard validation based on ikyyxd API responses
        if (!data || (data.status !== true && data.success !== true) || !data.result) {
            return reply("❌ Failed to process this link. The URL might be unsupported or private.");
        }

        const res = data.result;
        
        // Extracting Title/Caption safely
        const title = res.title || res.caption || res.desc || "AIO Downloaded Media";
        
        // Smart checking for video/media URL inside different standard keys
        let downloadUrl = res.url || res.video || res.link || res.download;

        // If the API returns media inside an array list
        if (!downloadUrl && Array.isArray(res.media)) {
            downloadUrl = res.media[0]?.url || res.media[0];
        } else if (!downloadUrl && res.files) {
            downloadUrl = res.files.high || res.files.low || res.files.url;
        }

        if (!downloadUrl) {
            return reply("❌ Downloadable media link not found in the API response.");
        }

        // Preparing clean caption text matching your bot style
        let captionText = `📥 *ALL-IN-ONE DOWNLOADER* 📥\n\n`;
        captionText += `📌 *Title:* ${title}\n\n`;
        captionText += `*Powered by DR KAMRAN*`;

        // Detecting type if explicitly provided by API, otherwise defaulting to Video
        const mediaType = (res.type || "").toLowerCase();

        if (mediaType === 'audio' || mediaType === 'mp3') {
            // Send as direct playable Audio
            return await conn.sendMessage(from, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mp4', 
                ptt: false 
            }, { quoted: mek });
        } else if (mediaType === 'image' || mediaType === 'photo') {
            // Send as Image
            return await conn.sendMessage(from, { 
                image: { url: downloadUrl }, 
                caption: captionText 
            }, { quoted: mek });
        } else {
            // Default: Send as Direct Video
            return await conn.sendMessage(from, { 
                video: { url: downloadUrl }, 
                caption: captionText 
            }, { quoted: mek });
        }

    } catch (error) {
        console.error(error);
        return reply(`❌ Gagal memproses, coba lagi nanti: ${error.message}`);
    }
});
