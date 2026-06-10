const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktoksearch",
    alias: ["ttsearch", "tiktok"],
    desc: "Search TikTok videos using a query.",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // Agar user query enter nahi karta
        if (!q) return reply("❌ Please provide a search query!\n\n*Example:* .tiktoksearch funny cats");

        // Reacting or sending a temporary waiting message
        await reply("⏳ Searching TikTok, please wait...");

        // API URL setup
        const apiUrl = `https://api.princetechn.com/api/search/tiktoksearch?apikey=prince&query=${encodeURIComponent(q)}`;
        
        // Fetching data from Prince API
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Checking if data exists (API formats change, so we handle standard cases)
        const results = data.result || data.data;

        if (!results || results.length === 0) {
            return reply("❌ No results found for your search.");
        }

        // Formatting the response text
        let responseText = `🎵 *TikTok Search Results for:* _${q}_\n\n`;

        // Limiting to top 5 results to avoid a huge wall of text
        const maxResults = Math.min(results.length, 5);

        for (let i = 0; i < maxResults; i++) {
            let video = results[i];
            responseText += `*${i + 1}. Title:* ${video.title || 'No Title'}\n`;
            responseText += `👤 *Author:* ${video.author?.nickname || video.author || 'Unknown'}\n`;
            responseText += `🔗 *Link:* ${video.url || video.link || 'N/A'}\n`;
            responseText += `───────────────────\n\n`;
        }

        responseText += `*Powered by Prince API*`;

        // Send the final list of videos
        return await conn.sendMessage(from, { text: responseText }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ An error occurred while fetching data: ${error.message}`);
    }
});
