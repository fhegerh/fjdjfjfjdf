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
        // Query check
        if (!q) return reply("❌ Please provide a search query!\n\n*Example:* .tiktoksearch funny cats");

        // Waiting message
        await reply("⏳ Searching TikTok, please wait...");

        // API URL
        const apiUrl = `https://api.princetechn.com/api/search/tiktoksearch?apikey=prince&query=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        // [DEBUG] Yeh aapke bot ke terminal (cmd/heroku) me check karne ke liye hai ke API kya bhej rahi hai
        console.log("=== TIKTOK API RESPONSE ===", JSON.stringify(data, null, 2));

        // Agar API status false bhejti hai ya koi error message aata hai
        if (data.status === false || data.error) {
            return reply(`❌ *API Error:* ${data.message || data.error || "Something went wrong with the API key or server."}`);
        }

        // Data arrays ke alag-alag formats ko detect karne ke liye robust check
        let results = [];
        if (Array.isArray(data)) {
            results = data;
        } else if (data && Array.isArray(data.result)) {
            results = data.result;
        } else if (data && Array.isArray(data.data)) {
            results = data.data;
        } else if (data && Array.isArray(data.results)) {
            results = data.results;
        }

        // Agar array khali miley
        if (!results || results.length === 0) {
            return reply("❌ No results found for your search. The API returned an empty list.");
        }

        // Formatting response text
        let responseText = `🎵 *TikTok Search Results for:* _${q}_\n\n`;
        const maxResults = Math.min(results.length, 5); // Sirf top 5 results dikhane ke liye

        for (let i = 0; i < maxResults; i++) {
            let video = results[i];
            
            // Checking multi-format keys (jo bhi key available ho utha le)
            let title = video.title || video.desc || video.description || 'No Title';
            let author = video.author?.nickname || video.author?.username || video.author || 'Unknown';
            let link = video.url || video.link || video.play || 'N/A';

            responseText += `*${i + 1}. Title:* ${title}\n`;
            responseText += `👤 *Author:* ${author}\n`;
            responseText += `🔗 *Link:* ${link}\n`;
            responseText += `───────────────────\n\n`;
        }

        responseText += `*Powered by DR KAMRAN*`;

        // Send results
        return await conn.sendMessage(from, { text: responseText }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ An error occurred while fetching data: ${error.message}`);
    }
});
