const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktoksearch",
    alias: ["ttsearch", "tktk", "vtsearch"],
    desc: "Search videos on TikTok using keywords.",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a search query!\n\n*Example:* .ttsearch funny cats");

        await reply(`⏳ Searching TikTok for "${q}"...`);

        // Time logic from your original script (Filter for last 1 year)
        const now = Date.now();
        const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
        
        // Payload payload mapping for revid.ai API
        const payload = {
            keywords: q,
            filtersFast: [
                "nbChar > 10",
                "lang = 'en'",
                `createTime >= ${Math.floor(oneYearAgo / 1000)} AND createTime <= ${Math.floor(now / 1000)}`
            ],
            extraParams: {
                sort: ""
            }
        };

        // Making POST request via Axios
        const response = await axios.post('https://www.revid.ai/api/tiktok-search', payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        let data = response.data;
        if (typeof data === 'string') data = JSON.parse(data);

        // Validating the response array
        if (!data || !data.videos || !Array.isArray(data.videos) || data.videos.length === 0) {
            return reply("❌ No TikTok videos found for this keyword. Try something else.");
        }

        // Limiting to top 7 results to maintain clean layout on WhatsApp mobile screens
        const videos = data.videos.slice(0, 7);

        let txt = `🎵 *TIKTOK VIDEO SEARCH* 🎵\n\n`;
        txt += `🔍 *Query:* ${q}\n`;
        txt += `📊 *Results Shown:* ${videos.length}\n\n`;

        videos.forEach((v, index) => {
            const title = v.desc ? v.desc.substring(0, 80).replace(/\n/g, ' ') : "No Description";
            const views = v.playCount ? v.playCount.toLocaleString() : '0';
            const likes = v.diggCount ? v.diggCount.toLocaleString() : '0';
            const author = v.userNickname || v.username || "TikTok User";
            
            // Extracting standard URL or CDN direct upload stream
            const videoUrl = v.urlUploaded || v.url || `https://www.tiktok.com/@${v.username}/video/${v.id}`;

            txt += `${index + 1}. 📌 *Title:* ${title}...\n`;
            txt += `👤 *Author:* ${author}\n`;
            txt += `👁️ *Views:* ${views}  |  ❤️ *Likes:* ${likes}\n`;
            txt += `🔗 *Link:* ${videoUrl}\n\n`;
        });

        txt += `_Tip: Copy the link and use .dl command to download the video._\n\n`;
        txt += `*Powered by DR KAMRAN*`;

        return await reply(txt);

    } catch (error) {
        console.error(error);
        return reply(`❌ TikTok Search Error: ${error.message}`);
    }
});
