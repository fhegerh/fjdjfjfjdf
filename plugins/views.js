const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ttboost",
    alias: ["tiktokboost", "boost"],
    desc: "Boost TikTok video views or interactions safely.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // 1. Ultra safe string validation to prevent silent crashes
        if (!q || typeof q !== 'string' || !q.trim()) {
            return reply("❌ *Format Galat Hai!*\n\n*Usage:* `,ttboost [TikTok-URL] [Target]`\n\n*Example:* `,ttboost https://vt.tiktok.com/ZSQDgCmj5/ 100`\n\n_(Target nahi likhenge toh auto 100 ho jayega)_");
        }

        const inputParts = q.trim().split(/\s+/);
        const tiktokUrl = inputParts[0];
        const targetCount = inputParts[1] || "100";

        if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
            return reply("❌ *Invalid URL!* Please provide a valid TikTok link.");
        }

        await reply("⚡ *Processing your boost request... Please wait.*");

        const endpointUrl = `https://api-xemoz-official.my.id/api/tools/tiktok-boost.php?url=${encodeURIComponent(tiktokUrl)}&target=${targetCount}`;

        // 2. Added validateStatus so bad gateway or api errors don't crash axios
        const response = await axios.get(endpointUrl, { 
            timeout: 60000,
            validateStatus: () => true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });

        let data = response.data;
        
        // Safe JSON parsing wrapper
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                return reply(`📢 *Server Direct Response:* ${data.slice(0, 300)}`);
            }
        }

        // 3. Robust response matching structure
        if (response.status === 200 && (data?.status === 200 || data?.success === true || data?.message)) {
            let msgText = `⚡ *TIKTOK BOOST SUBMITTED* ⚡\n\n`;
            msgText += `🔗 *Video Link:* ${tiktokUrl}\n`;
            msgText += `🎯 *Target Limit:* ${targetCount}\n`;
            msgText += `📢 *Status:* ${data?.message || data?.result || 'Successfully Queued!'}\n\n`;
            msgText += `*POWERED BY DR KAMRAN*`;

            return await reply(msgText);
        } else {
            return reply(`❌ *Server Rejected:* ${data?.message || 'API endpoint down or rejected request.'}`);
        }

    } catch (error) {
        console.error(error);
        try {
            return reply(`❌ *Boost System Fail:* ${error.message}`);
        } catch (innerError) {
            console.error("Critical: Could not send error reply", innerError);
        }
    }
});
