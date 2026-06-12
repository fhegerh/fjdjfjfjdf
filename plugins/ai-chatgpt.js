const { cmd } = require('../command');
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

// Configuration
const API_KEY = "00d31898ca4091c9631f43479e009633db569e423254dca015ea76a0ef2782a5"; // ← Yahan apna key zaroor daalein
const ENDPOINT = "https://back.asitha.top/api/channel/list";

// Helper function for date formatting
function formatExpiry(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    const now = Date.now();
    const diffMs = d.getTime() - now;
    if (diffMs < 0) return "EXPIRED";
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffM = Math.floor((diffMs % 3_600_000) / 60_000);
    return `${d.toLocaleString()} (in ${diffH}h ${diffM}m)`;
}

cmd({
    pattern: "kamranmd",
    alias: ["listchannel", "kamranlist"],
    category: "tools",
    filename: __filename,
    description: "Check your active channels on Asitha.top",
    use: '.asitha',
},
async (conn, mek, m, { from, reply }) => {
    try {
        if (!API_KEY || API_KEY.includes("Your API Key")) {
            return await reply("❌ API_KEY set nahi hai. Code mein API_KEY variable update karein.");
        }

        await reply("🔄 Fetching channels from Asitha...");

        const res = await fetch(ENDPOINT, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Accept": "application/json",
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
        }

        const data = await res.json();
        const channels = Array.isArray(data.channels) ? data.channels : [];

        if (channels.length === 0) {
            return await reply("📭 Belum ada channel aktif.");
        }

        let listText = `✅ *${channels.length} CHANNEL AKTIF*\n\n`;
        
        for (let i = 0; i < channels.length; i++) {
            const c = channels[i];
            listText += `*${i + 1}.* ${c.channelLink ?? "(no link)"}\n`;
            if (c.reactions) listText += `   ⭐ Reaction : ${c.reactions}\n`;
            if (c.expiresAt) listText += `   ⏳ Expires : ${formatExpiry(c.expiresAt)}\n`;
            listText += `\n`;
        }

        listText += `> © KAMRAN-MINI-BOT ッ`;
        await reply(listText);

    } catch (err) {
        console.error(err);
        await reply(`❌ Error: ${err.message}`);
    }
});
