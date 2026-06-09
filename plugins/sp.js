const { cmd } = require('../command');
const config = require('../config');
const axios = require("axios");

// 🔒 HIGH-LEVEL OBFUSCATED DATA STORAGE MATRIX (100% SECURE)
const _0xKMRMatrix = [
    "76616a6972612d56616a6972614f6666696369616c32303033", // 0: Your Permanent API Key
    "68747470733a2f2f76616a6972612d6f6666696369616c2d617069732e76657263656c2e6170702f6170692f786e78782d646c", // 1: XNXX Download API EndPoint
    "c2a9204b414d52414e2d4d494e492d424f5420e383bb", // 2: Credits Signature
    "73656e644d657373616765" // 3: sendMessage
];

const _0xR = (idx) => Buffer.from(_0xKMRMatrix[idx], 'hex').toString('utf-8');

// 🛡️ INTEGRITY CORE GUARD
(() => {
    const verification = _0xR(2);
    if (!verification.includes("KAMRAN") || !verification.includes("MINI-BOT") || _0xKMRMatrix.length !== 4) {
        console.error("⚠️ SYSTEM SUSPENDED: Structural alteration detected.");
        process.exit(1);
    }
})();

cmd({
    pattern: "xnxx",
    alias: ["xnxxdl", "xnxxdown"],
    category: "downloader",
    desc: "Download videos using API",
    use: "<xnxx_url>",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    const sysCredit = _0xR(2);
    if (!sysCredit.includes("KAMRAN")) return reply("🚨 Structural bypass locked.");

    const activeKey = _0xR(0);
    const apiDl = _0xR(1);
    const signFooter = `> *${sysCredit}*`;

    const react = async (emoji) => {
        try { await conn.sendMessage(from, { react: { text: emoji, key: mek.key } }); } catch (e) {}
    };

    try {
        if (!q) {
            await react("❌");
            return reply("❌ *Opps! URL Missing* ❌\n\nPlease provide a valid video link!\n📌 *Example:* `.xnxx https://...`");
        }

        await react("📥");
        await reply(`🚀 _Fetching video from servers... Please wait!_`);

        // Fetching data from the API
        const response = await axios.get(apiDl, {
            params: { apikey: activeKey, url: q },
            timeout: 45000
        });

        if (response.status !== 200 || !response.data || !response.data.result) {
            await react("❌");
            return reply("❌ *API Error:* Failed to retrieve content data for this link.");
        }

        const data = response.data.result;
        
        // Mapped variables from API response (Handling standard response keys dynamically)
        const videoUrl = data.url || data.dl_link || data.direct || data.link || data.low || data.high;
        const videoTitle = data.title || "XNXX_Video";
        const videoDuration = data.duration || "N/A";

        if (!videoUrl) {
            await react("❌");
            return reply("❌ *Error:* Download link could not be generated from the API response.");
        }

        await reply(`🎬 *Downloading:* \`${videoTitle}\`\n⏳ *Duration:* \`${videoDuration}\`\n\n_Uploading document file..._`);

        // Cleaning file name for safe delivery
        const cleanFileName = `${videoTitle.replace(/[^a-zA-Z0-9 ]/g, "_")}.mp4`;

        // Sending payload as a document attachment to preserve high-quality file architecture
        let documentPayload = {
            document: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: cleanFileName,
            caption: `🎬 *Title:* ${videoTitle}\n⏱️ *Duration:* ${videoDuration}\n\n${signFooter}`
        };

        await conn[_0xR(3)](from, documentPayload, { quoted: mek });
        await react("✅");

    } catch (e) {
        await react("❌");
        return reply(`❌ *Error Processing Request:* ${e.message}`);
    }
});
