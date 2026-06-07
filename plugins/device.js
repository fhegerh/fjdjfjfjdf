const { cmd } = require('../command');
const config = require('../config');
const axios = require("axios");
const sharp = require("sharp");

// Encrypted critical components to prevent modification and piracy
const _0xMLF = {
    cr: "c2a9204b414d52414e2d4d494e492d424f5420e383bb", // © KAMRAN-MINI-BOT ッ
    ak: "76616a6972612d3233696b7373696735312d31373830363531383733373637", // API Key
    sApi: "68747470733a2f2f76616a6972612d6f6666696369616c2d617069732e76657263656c2e6170702f6170692f6d6c66626473", // Search API URL
    dApi: "68747470733a2f2f76616a6972612d6f6666696369616c2d617069732e76657263656c2e6170702f6170692f6d6c666264646c" // Download API URL
};

const _dec = (hex) => Buffer.from(hex, 'hex').toString('utf-8');

// Immediate Boot Integrity Guard
(() => {
    const check = _dec(_0xMLF.cr);
    if (!check.includes("KAMRAN") || !check.includes("MINI-BOT")) {
        console.error("FATAL ERROR: Unauthorized alteration detected in plugin signature! Halting execution.");
        process.exit(1);
    }
})();

// Helper function to process high-compatibility jpeg thumbnails
async function getThumbnailBuffer(url) {
  if (!url) return null;
  try {
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    return await sharp(data)
      .resize(300, 300)
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (err) {
    console.error("Error processing thumbnail:", err.message || err);
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
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
    // Dynamic Runtime Identity Check
    const botCredits = _dec(_0xMLF.cr);
    if (!botCredits || botCredits.indexOf("KAMRAN") === -1) {
        return reply("🚨 *Security Core:* Unauthorized structural modification. Process suspended.");
    }

    const apiKey = _dec(_0xMLF.ak);
    const searchApiUrl = _dec(_0xMLF.sApi);
    const downloadApiUrl = _dec(_0xMLF.dApi);
    const footerText = `> *${botCredits}*`;

    // Local Framework Reaction System
    const react = async (emoji) => {
        try { 
            await conn.sendMessage(from, { react: { text: emoji, key: mek.key } }); 
        } catch (e) { 
            console.error("Reaction failed:", e); 
        }
    };

    try {
        await react("🎬");

        if (!q) {
            return reply(
                "❌ Please provide a movie name to search!\n\n" +
                "Example: .mlfbd From Season 4\n" +
                "Or: .mlfbd Drishyam 3"
            );
        }

        await reply(`🔍 Searching for "${q}" on MLFBD...`);

        const response = await axios.get(searchApiUrl, {
            params: { apikey: apiKey, text: q },
            timeout: 30000
        });

        if (response.status !== 200 || !response.data || !response.data.result || response.data.result.length === 0) {
            await react("❌");
            return reply("❌ No results found on MLFBD for your query.");
        }

        const results = response.data.result;

        let listText = `🎬 *MLFBD MOVIE SEARCH*\n\n🔎 *Query:* ${q.toUpperCase()}\n\n`;
        results.forEach((v, i) => {
            listText += `*${i + 1}* ☛ ${v.title} \n⭐ Rating: [${v.rate || 'N/A'}] | Year: [${v.year || 'N/A'}]\n\n`;
        });

        listText += `*🔢 Reply with a number to select your choice*\n\n` + footerText;

        const sentSearch = await conn.sendMessage(from, {
            image: { url: results[0].image || "https://placehold.co/600x400?text=No+Poster" },
            caption: listText
        }, { quoted: mek });

        const searchMsgId = sentSearch.key.id;
        let detailsTimeout, downloadTimeout;

        // ================= INTERACTIVE STEP: DETAILS HANDLER =================
        const detailsHandler = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg?.message || msg.key.remoteJid !== from) return;

                const ctx = msg.message.extendedTextMessage?.contextInfo || msg.message.conversation?.contextInfo;
                if (ctx?.stanzaId !== searchMsgId) return;

                const choice = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
                const num = parseInt(choice);
                if (isNaN(num) || num < 1 || num > results.length) return;
                
                const selected = results[num - 1];
                if (!selected) return;

                conn.ev.off("messages.upsert", detailsHandler);
                clearTimeout(detailsTimeout);

                await react("⏳");

                const detailResponse = await axios.get(downloadApiUrl, {
                    params: { apikey: apiKey, url: selected.link },
                    timeout: 30000
                });

                if (detailResponse.status !== 200 || !detailResponse.data || !detailResponse.data.result) {
                    await react("❌");
                    return reply("❌ Failed to pull download properties for this item.");
                }

                const movieDetails = detailResponse.data.result;
                const dlLinks = movieDetails.downloads || [];

                if (dlLinks.length === 0) {
                    await react("❌");
                    return reply("❌ No downloadable files were located for this selection.");
                }

                let cap = `🎬 *${movieDetails.title || selected.title}*\n\n`;
                cap += `ℹ️ *Description:* ${movieDetails.description || 'No description available'}\n`;
                cap += `🎭 *Genres:* ${movieDetails.genres || 'N/A'}\n`;
                cap += `📅 *Release Date:* ${movieDetails.release || 'N/A'}\n`;
                cap += `⭐ *Rating:* ${movieDetails.rating || selected.rate}\n\n`;
                cap += `┌───────────────────\n`;
                cap += `│ 📂 *Available Download Mirrors:*\n`;
                
                dlLinks.forEach((dl, i) => {
                    cap += `│ *${i + 1}* ☛ Mirror ${i + 1} - Quality: [${dl.quality || '720p'}] (${dl.size || 'Unknown'})\n`;
                });
                cap += `└───────────────────\n\n`;
                cap += `*🔢 Reply a number to begin download submission*\n\n` + footerText;

                const sentDetail = await conn.sendMessage(from, {
                    image: { url: movieDetails.image || selected.image || "https://placehold.co/600x400?text=No+Poster" },
                    caption: cap
                }, { quoted: msg });

                const detailMsgId = sentDetail.key.id;

                // ================= INTERACTIVE STEP: DOWNLOAD HANDLER =================
                const downloadHandler = async (up) => {
                    try {
                        const dlMsg = up.messages[0];
                        if (!dlMsg?.message || dlMsg.key.remoteJid !== from) return;

                        const dlCtx = dlMsg.message.extendedTextMessage?.contextInfo || dlMsg.message.conversation?.contextInfo;
                        if (dlCtx?.stanzaId !== detailMsgId) return;

                        const pick = (dlMsg.message.conversation || dlMsg.message.extendedTextMessage?.text || "").trim();
                        const dlNum = parseInt(pick);
                        if (isNaN(dlNum) || dlNum < 1 || dlNum > dlLinks.length) return;

                        const selectedDl = dlLinks[dlNum - 1];
                        if (!selectedDl) return;

                        conn.ev.off("messages.upsert", downloadHandler);
                        clearTimeout(downloadTimeout);

                        await conn.sendMessage(from, { react: { text: "📥", key: dlMsg.key } });
                        
                        const targetFileUrl = selectedDl.direct;
                        const cleanFileName = `${(movieDetails.title || selected.title).replace(/[^a-zA-Z0-9 ]/g, "_")}_${selectedDl.quality || '720p'}.mp4`;

                        await reply(`🚀 Processing your movie file request... Sending Document now.`);

                        const thumbBuffer = await getThumbnailBuffer(movieDetails.image || selected.image);

                        let documentPayload = {
                            document: { url: targetFileUrl },
                            mimetype: "video/mp4",
                            fileName: cleanFileName,
                            caption: `🎬 *${movieDetails.title || selected.title}*\n⚖️ *Size:* ${selectedDl.size || 'N/A'}\n🌟 *Quality:* ${selectedDl.quality || '720p'}\n\n` + footerText
                        };

                        if (thumbBuffer && Buffer.isBuffer(thumbBuffer)) {
                            documentPayload.jpegThumbnail = thumbBuffer;
                        }

                        await conn.sendMessage(from, documentPayload, { quoted: dlMsg });
                        await conn.sendMessage(from, { react: { text: "✅", key: dlMsg.key } });

                    } catch (dlErr) {
                        conn.ev.off("messages.upsert", downloadHandler);
                        console.error("MLFBD download failed:", dlErr.message);
                        reply(`❌ An error occurred during file delivery: ${dlErr.message}`);
                    }
                };

                conn.ev.on("messages.upsert", downloadHandler);
                
                downloadTimeout = setTimeout(() => {
                    conn.ev.off("messages.upsert", downloadHandler);
                }, 300000);

            } catch (detErr) {
                conn.ev.off("messages.upsert", detailsHandler);
                console.error("MLFBD details failed:", detErr.message);
                reply(`❌ An error occurred while loading details: ${detErr.message}`);
            }
        };

        conn.ev.on("messages.upsert", detailsHandler);
        
        detailsTimeout = setTimeout(() => {
            conn.ev.off("messages.upsert", detailsHandler);
        }, 300000);

    } catch (e) {
        console.error("MLFBD Downloader error:", e.message);
        await react("❌");
        return reply(`❌ Error processing your request: ${e.message}`);
    }
});
