const { cmd } = require('../command');
const config = require('../config');
const axios = require("axios");
const sharp = require("sharp");

// 🔒 HIGH-LEVEL OBFUSCATED DATA STORAGE MATRIX
const _0xKMRMatrix = [
    "76616a6972612d353871727936307237332d31373830393335353033343034", // 0: API Key
    "68747470733a2f2f76616a6972612d6f6666696369616c2d617069732e76657263656c2e6170702f6170692f6d6c66626473", // 1: MLFBD Search API
    "68747470733a2f2f76616a6972612d6f6666696369616c2d617069732e76657263656c2e6170702f6170692f6d6l666264646c", // 2: MLFBD Download API
    "c2a9204b414d52414e2d4d494e492d424f5420e383bb", // 3: Credits Signature
    "6d657373616765732e757073657274", // 4: messages.upsert
    "73656e644d657373616765", // 5: sendMessage
    "657874656e646564546578744d657373616765", // 6: extendedTextMessage
    "636f6e74657874496e666f", // 7: contextInfo
    "6172726179627566666572" // 8: arraybuffer
];

const _0xR = (idx) => Buffer.from(_0xKMRMatrix[idx], 'hex').toString('utf-8');

// 🛡️ INTEGRITY CORE GUARD
(() => {
    const verification = _0xR(3);
    if (!verification.includes("KAMRAN") || !verification.includes("MINI-BOT") || _0xKMRMatrix.length !== 9) {
        console.error("⚠️ SYSTEM SUSPENDED: Structural alteration detected.");
        process.exit(1);
    }
})();

async function getThumbnailBuffer(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return null;
  try {
    const { data } = await axios.get(url, { responseType: _0xR(8), timeout: 10000 });
    return await sharp(data).resize(300, 300).jpeg({ quality: 80 }).toBuffer();
  } catch (err) {
    return null;
  }
}

cmd({
    pattern: "mlfbd",
    alias: ["movie", "downloadmovie", "cinemalk"],
    category: "downloader",
    desc: "Search and download movies from MLFBD via API",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    const sysCredit = _0xR(3);
    if (!sysCredit.includes("KAMRAN")) return reply("🚨 Structural bypass locked.");

    const activeKey = _0xR(0);
    const apiSrc = _0xR(1);
    const apiDl = _0xR(2);
    const signFooter = `> *${sysCredit}*`;

    const react = async (emoji) => {
        try { await conn.sendMessage(from, { react: { text: emoji, key: mek.key } }); } catch (e) {}
    };

    try {
        await react("🎬");
        if (!q) return reply("❌ *Opps! Title Missing* ❌\n\nPlease provide a movie name to search!\n📌 *Example:* `.mlfbd From Season 4`");

        await reply(`🔍 _Searching for *"${q}"* on MLFBD servers..._`);

        const response = await axios.get(apiSrc, {
            params: { apikey: activeKey, text: q },
            timeout: 30000
        });

        if (response.status !== 200 || !response.data || !response.data.result || response.data.result.length === 0) {
            await react("❌");
            return reply(`🛸 *No Results Found!*\nMLFBD par *"${q}"* naam ki koi movie nahi mili.`);
        }

        const results = response.data.result;

        // ✨ ANTI-SHATTER PREMIUM MOBILE LAYOUT
        let listText = `🎬 *============= MLFBD SEARCH =============* 🎬\n\n`;
        listText += `🔎 *Query:* \`${q.toUpperCase()}\`\n`;
        listText += `✨ *Results Found:* ${results.length}\n\n`;
        listText += `───────────────────────────────\n`;

        results.forEach((v, i) => {
            listText += `🍿 *[${i + 1}]* _${v.title || 'Unknown Title'}_\n`;
            listText += `⭐ *Rating:* \`${v.rate || 'N/A'}\` | 📅 *Year:* \`${v.year || 'N/A'}\`\n`;
            listText += `───────────────────────────────\n`;
        });

        listText += `\n⚡ *Reply with the item number* to view options.\n\n${signFooter}`;

        // Image Deep Scan Fallback Layer
        const firstImage = results[0].image || results[0].img || results[0].poster || results[0].thumbnail || results[0].thumb || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600";
        
        const sentSearch = await conn[_0xR(5)](from, { image: { url: firstImage }, caption: listText }, { quoted: mek });
        const searchMsgId = sentSearch.key.id;
        let detailsTimeout, downloadTimeout;

        // ================= INTERACTIVE STEP: DETAILS HANDLER =================
        const detailsHandler = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg?.message || msg.key.remoteJid !== from) return;

                const ctx = msg.message[_0xR(6)]?.contextInfo || msg.message.conversation?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
                if (ctx?.stanzaId !== searchMsgId) return;

                const choice = (msg.message.conversation || msg.message[_0xR(6)]?.text || "").trim();
                const num = parseInt(choice);
                if (isNaN(num) || num < 1 || num > results.length) return;
                
                const selected = results[num - 1];
                if (!selected) return;

                conn.ev.off(_0xR(4), detailsHandler);
                clearTimeout(detailsTimeout);
                await react("⏳");

                const detailResponse = await axios.get(apiDl, {
                    params: { apikey: activeKey, url: selected.link },
                    timeout: 30000
                });

                if (detailResponse.status !== 200 || !detailResponse.data || !detailResponse.data.result) {
                    await react("❌");
                    return reply("❌ *Error:* Failed to pull download properties for this selection.");
                }

                const movieDetails = detailResponse.data.result;
                const dlLinks = movieDetails.downloads || [];

                if (dlLinks.length === 0) {
                    await react("❌");
                    return reply("❌ *Sorry:* No download mirrors configurations mapped.");
                }

                let cap = `🎥 *${movieDetails.title || selected.title}*\n`;
                cap += `───────────────────────────────\n\n`;
                if (movieDetails.description) cap += `📝 *Description:* \n_${movieDetails.description}_\n\n`;
                cap += `🎭 *Genres:* \`${movieDetails.genres || 'N/A'}\`\n`;
                cap += `📅 *Release Date:* \`${movieDetails.release || 'N/A'}\`\n`;
                cap += `⭐ *Rating:* \`${movieDetails.rating || selected.rate || 'N/A'}\`\n\n`;
                
                cap += `📥 *AVAILABLE MIRRORS* 📥\n`;
                cap += `───────────────────────────────\n`;
                
                dlLinks.forEach((dl, i) => {
                    cap += `⚡ *[${i + 1}]* Mirror ${i + 1}\n`;
                    cap += `🌟 *Quality:* \`${dl.quality || '720p'}\` | ⚖️ *Size:* \`${dl.size || 'Unknown'}\`\n`;
                    cap += `───────────────────────────────\n`;
                });
                cap += `\n⚡ *Reply with a mirror number* to start downloading.\n\n${signFooter}`;

                // Image Fallback Engine
                const detailImg = movieDetails.image || movieDetails.img || movieDetails.poster || movieDetails.thumbnail || movieDetails.thumb || selected.image || selected.img || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600";

                const sentDetail = await conn[_0xR(5)](from, { image: { url: detailImg }, caption: cap }, { quoted: msg });
                const detailMsgId = sentDetail.key.id;

                // ================= INTERACTIVE STEP: DOWNLOAD HANDLER =================
                const downloadHandler = async (up) => {
                    try {
                        const dlMsg = up.messages[0];
                        if (!dlMsg?.message || dlMsg.key.remoteJid !== from) return;

                        const dlCtx = dlMsg.message[_0xR(6)]?.contextInfo || dlMsg.message.conversation?.contextInfo || dlMsg.message.extendedTextMessage?.contextInfo;
                        if (dlCtx?.stanzaId !== detailMsgId) return;

                        const pick = (dlMsg.message.conversation || dlMsg.message[_0xR(6)]?.text || "").trim();
                        const dlNum = parseInt(pick);
                        if (isNaN(dlNum) || dlNum < 1 || dlNum > dlLinks.length) return;

                        const selectedDl = dlLinks[dlNum - 1];
                        if (!selectedDl) return;

                        conn.ev.off(_0xR(4), downloadHandler);
                        clearTimeout(downloadTimeout);

                        await conn[_0xR(5)](from, { react: { text: "📥", key: dlMsg.key } });
                        
                        const targetFileUrl = selectedDl.direct || selectedDl.url || selectedDl.link;
                        const cleanFileName = `${(movieDetails.title || selected.title).replace(/[^a-zA-Z0-9 ]/g, "_")}_${selectedDl.quality || '720p'}.mp4`;

                        await reply(`🚀 *Processing MLFBD File...* \nUploading document. Please wait!`);

                        const targetThumbUrl = movieDetails.image || movieDetails.img || movieDetails.poster || selected.image || selected.img;
                        const thumbBuffer = await getThumbnailBuffer(targetThumbUrl);

                        let documentPayload = {
                            document: { url: targetFileUrl },
                            mimetype: "video/mp4",
                            fileName: cleanFileName,
                            caption: `🎬 *${movieDetails.title || selected.title}*\n───────────────────────────────\n🌟 *Quality:* ${selectedDl.quality || '720p'}\n⚖️ *Size:* ${selectedDl.size || 'N/A'}\n───────────────────────────────\n\n${signFooter}`
                        };

                        if (thumbBuffer && Buffer.isBuffer(thumbBuffer)) {
                            documentPayload.jpegThumbnail = thumbBuffer;
                        }

                        await conn[_0xR(5)](from, documentPayload, { quoted: dlMsg });
                        await conn[_0xR(5)](from, { react: { text: "✅", key: dlMsg.key } });

                    } catch (dlErr) {
                        conn.ev.off(_0xR(4), downloadHandler);
                    }
                };

                conn.ev.on(_0xR(4), downloadHandler);
                downloadTimeout = setTimeout(() => { conn.ev.off(_0xR(4), downloadHandler); }, 300000);

            } catch (detErr) {
                conn.ev.off(_0xR(4), detailsHandler);
            }
        };

        conn.ev.on(_0xR(4), detailsHandler);
        detailsTimeout = setTimeout(() => { conn.ev.off(_0xR(4), detailsHandler); }, 300000);

    } catch (e) {
        await react("❌");
        return reply(`❌ *Error Processing Request:* ${e.message}`);
    }
});
