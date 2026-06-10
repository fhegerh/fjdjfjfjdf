const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ttboost",
    alias: ["tiktokboost", "boost"],
    desc: "Boost TikTok video views or interactions using target numbers.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        if (!q) {
            return reply("❌ *Format Galat Hai!*\n\n*Pariqa:* `.ttboost [TikTok-URL] [Target-Amount]`\n\n*Example:* `.ttboost https://vt.tiktok.com/ZSxGhy4pD/ 100`\n\n_(Agar target nahi likhenge toh default 100 select ho jayega)_");
        }

        // Parsing inputs dynamically from query text
        const inputParts = q.trim().split(/\s+/);
        const tiktokUrl = inputParts[0];
        const targetCount = inputParts[1] || "100"; // Fallback to 100 if target is missing

        // Basic link validation layer
        if (!tiktokUrl.includes("tiktok.com")) {
            return reply("❌ Invalid URL! Please provide a valid TikTok video link.");
        }

        await reply("⚡ Sending payload to TikTok server framework... Please wait.");

        // Constructing dynamic API endpoint URL
        const endpointUrl = `https://api-xemoz-official.my.id/api/tools/tiktok-boost.php?url=${encodeURIComponent(tiktokUrl)}&target=${targetCount}`;

        const response = await axios.get(endpointUrl, { timeout: 60000 });
        let data = response.data;

        // Auto-correct JSON parsing if delivered as a raw string format
        if (typeof data === 'string') data = JSON.parse(data);

        // Standard validation check mapping on common API nodes
        if (response.status === 200 || data?.status === 200 || data?.success === true) {
            let msgText = `⚡ *TIKTOK BOOST SUBMITTED* ⚡\n\n`;
            msgText += `🔗 *Video Link:* ${tiktokUrl}\n`;
            msgText += `🎯 *Target Limit:* ${targetCount}\n`;
            msgText += `📢 *Server Response:* ${data?.message || data?.result || 'Process successfully queued!'}\n\n`;
            msgText += `_Note: Submissions take a few minutes to replicate completely on live streams._\n\n`;
            msgText += `*POWERED BY DR KAMRAN*`;

            return await reply(msgText);
        } else {
            return reply(`❌ Server Rejected Request: ${data?.message || 'Unknown processing error.'}`);
        }

    } catch (error) {
        console.error(error);
        return reply(`❌ Boost System Fail: ${error.message}`);
    }
});
