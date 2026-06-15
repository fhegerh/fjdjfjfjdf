const axios = require("axios");
const { cmd } = require('../command');

cmd({
    pattern: "tiktoksearch",
    alias: ["ttsearch"],
    category: "downloader",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, react }) => {
    
    if (!q) return reply("❌ Please provide a query!");
    await react("🔍");

    try {
        const apiUrl = `https://api.princetechn.com/api/search/tiktoksearch?apikey=prince&query=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl);
        
        // LOGGING: Ye command chalane ke baad 'heroku logs --tail' mein check karein
        console.log("API Response:", JSON.stringify(res.data, null, 2));

        if (!res.data || !res.data.result || res.data.result.length === 0) {
            await react("❌");
            return reply("❌ API ne koi result nahi bheja. Check karein ki kya query valid hai.");
        }

        const results = res.data.result;
        let txt = `🎬 *TIKTOK RESULTS*\n\n`;
        results.slice(0, 3).forEach((v, i) => {
            txt += `*${i + 1}* ☛ ${v.title || "No Title"}\n🔗 ${v.url || "N/A"}\n\n`;
        });
        
        await conn.sendMessage(from, { text: txt }, { quoted: mek });
        await react("✅");

    } catch (e) {
        console.error("TikTok Error:", e.message);
        await react("❌");
        reply("❌ Error: " + e.message);
    }
});
