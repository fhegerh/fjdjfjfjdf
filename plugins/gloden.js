const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "xnxx",
    alias: ["xnxxdl", "xnxxdown"],
    desc: "Download videos from XNXX via link.",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // Checking if URL is provided
        if (!q) return reply("❌ Please provide a valid XNXX video link!\n\n*Example:* .xnxx https://www.xnxx.health/video-1256sd47/...");

        // Temporary loading message
        await reply("⏳ Fetching and downloading video, please wait...");

        // API URL setup
        const apiUrl = `https://api.princetechn.com/api/download/xnxxdl?apikey=prince&url=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Checking if API response is successful
        if (!data || data.success !== true || !data.result) {
            return reply("❌ Failed to fetch video data. Make sure the link is correct or API key is valid.");
        }

        const videoInfo = data.result;
        const title = videoInfo.title || "XNXX Video";
        const duration = videoInfo.duration ? `${videoInfo.duration} seconds` : "Unknown";
        
        // Picking High quality first, if not available then fallback to Low quality
        const downloadUrl = videoInfo.files?.high || videoInfo.files?.low;

        if (!downloadUrl) {
            return reply("❌ Downloadable video link not found in the API response.");
        }

        // Preparing the caption text
        let captionText = `🎬 *XNXX VIDEO DOWNLOADER* 🎬\n\n`;
        captionText += `📌 *Title:* ${title}\n`;
        captionText += `⏱️ *Duration:* ${duration}\n\n`;
        captionText += `*Powered by DR KAMRAN*`;

        // Sending the actual video file directly to WhatsApp
        return await conn.sendMessage(from, { 
            video: { url: downloadUrl }, 
            caption: captionText 
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ An error occurred during download: ${error.message}`);
    }
});
