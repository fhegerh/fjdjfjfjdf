const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktoksearch",
    alias: ["ttsearch", "tiktok"],
    desc: "Search TikTok videos using multiple APIs.",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a search query!\n\n*Example:* .tiktoksearch funny cats");

        await reply("⏳ Searching TikTok (trying server 1)...");

        // List of multiple APIs to try if one fails
        const apiSources = [
            `https://api.princetechn.com/api/search/tiktoksearch?apikey=prince&query=${encodeURIComponent(q)}`,
            `https://api.canyah.biz.id/api/search/tiktok?q=${encodeURIComponent(q)}`, // Backup API 1
            `https://api.lolhuman.xyz/api/tiktoksearch?apikey=freekey&query=${encodeURIComponent(q)}` // Backup API 2
        ];

        let results = [];
        let successSource = false;

        // Loop through APIs until we get results
        for (let i = 0; i < apiSources.length; i++) {
            try {
                if (i > 0) {
                    await reply(`⏳ Server ${i} failed or returned empty. Trying Backup Server ${i + 1}...`);
                }

                const response = await axios.get(apiSources[i]);
                const data = response.data;

                // Robust checking for data array in different API formats
                if (Array.isArray(data)) {
                    results = data;
                } else if (data && Array.isArray(data.result)) {
                    results = data.result;
                } else if (data && Array.isArray(data.data)) {
                    results = data.data;
                } else if (data && Array.isArray(data.results)) {
                    results = data.results;
                }

                // If we found valid results, break the loop
                if (results && results.length > 0) {
                    successSource = true;
                    break;
                }
            } catch (apiError) {
                console.log(`Server ${i + 1} Error:`, apiError.message);
                // Continue to next API if this one fails
            }
        }

        // If all APIs failed or returned empty
        if (!successSource || results.length === 0) {
            return reply("❌ All TikTok search servers are currently down or returning empty results. Please try again later or update your API keys.");
        }

        // Formatting the response text
        let responseText = `🎵 *TikTok Search Results for:* _${q}_\n\n`;
        const maxResults = Math.min(results.length, 5); // Top 5 results

        for (let i = 0; i < maxResults; i++) {
            let video = results[i];
            
            // Supporting different API response key names smoothly
            let title = video.title || video.desc || video.description || 'No Title';
            let author = video.author?.nickname || video.author?.username || video.author || 'Unknown';
            let link = video.url || video.link || video.play || 'N/A';

            responseText += `*${i + 1}. Title:* ${title}\n`;
            responseText += `👤 *Author:* ${author}\n`;
            responseText += `🔗 *Link:* ${link}\n`;
            responseText += `───────────────────\n\n`;
        }

        responseText += `*Powered by Multi-API Bot System*`;

        return await conn.sendMessage(from, { text: responseText }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ An unexpected error occurred: ${error.message}`);
    }
});
