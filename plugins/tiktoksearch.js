const axios = require("axios");
const { cmd } = require('../command');

cmd({
    pattern: "tiktok",
    alias: ["tt", "tiktoksearch"],
    category: "downloader",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, react }) => {
    
    if (!q) return reply("❌ Please provide a query!\nExample: .tiktok funny cats");
    
    await react("🔍");

    try {
        // API Request with your provided URL
        const apiUrl = `https://api.princetechn.com/api/search/tiktoksearch?apikey=prince&query=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl);
        
        // Checking if result exists
        const results = res.data.result;
        if (!results || results.length === 0) {
            await react("❌");
            return reply("❌ No videos found for your query.");
        }

        // Limit results to 5 to keep memory usage low
        const limitedResults = results.slice(0, 5);
        let txt = `🎬 *TIKTOK SEARCH RESULTS*\n\n`;
        
        limitedResults.forEach((v, i) => {
            txt += `*${i + 1}* ☛ ${v.title || "No Title"}\n🔗 ${v.url || "N/A"}\n\n`;
        });
        
        txt += `> © KAMRAN-MINI-BOT ッ`;
        
        await conn.sendMessage(from, { text: txt }, { quoted: mek });
        await react("✅");

    } catch (e) {
        console.error(e);
        await react("❌");
        reply("❌ Error: " + e.message);
    }
});
