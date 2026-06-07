const axios = require("axios");
const config = require("../../config");
const sharp = require("sharp");
const { cmd } = require("../command"); 

// Secure Encrypted Data Dictionary
const _0xmbx = [
    "dmFqaXJhLTIzaWtzc2lnNTEtMTc4MDY1MTg3Mzc2Nw==", // 0: API Key
    "aHR0cHM6Ly92YWppcmEtb2ZmaWNpYWwtYXBpcy52ZXJjZWwuYXBwL2FwaS9tb3ZpZWJveHM=", // 1: Search Endpoint
    "aHR0cHM6Ly92YWppcmEtb2ZmaWNpYWwtYXBpcy52ZXJjZWwuYXBwL2FwaS9tb3ZpZWJveGRscw==", // 2: Download Endpoint
    "bWVzc2FnZXMudXBzZXJ0" // 3: Event Listener
];
const _0xdec = (i) => Buffer.from(_0xmbx[i], "base64").toString("utf-8");

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
    pattern: "moviebox", // Changed from name to pattern
    alias: ["mbox", "movieboxdl"],
    category: "downloader",
    desc: "Search and download movies/series from MovieBox via API",
    filename: __filename
},
async (conn, mek, m, context) => {
    const { reply, react, q, socket, sock, from } = context;
    const client = socket || sock || conn;

    try {
        await react("🎬");

        if (!q) {
            return reply(
                "❌ *Opps! Title Missing* ❌\n\n" +
                "Please provide a movie or series name to search!\n" +
                "📌 *Example:* `.moviebox Interstellar`"
            );
        }

        await reply(`🔍 _Searching for *"${q}"* on MovieBox servers..._`);

        const response = await axios.get(_0xdec(1), {
            params: { apikey: _0xdec(0), query: q, text: q },
            timeout: 30000
        });

        if (response.status !== 200 || !response.data) {
            await react("❌");
            return reply("🛸 *API Error:* Server responded with an invalid status.");
        }

        let results = null;
        if (response.data) {
            if (Array.isArray(response.data.data)) {
                results = response.data.data;
            } else if (typeof response.data.data === 'object' && response.data.data !== null) {
                for (let key in response.data.data) {
                    if (Array.isArray(response.data.data[key])) {
                        results = response.data.data[key];
                        break;
                    }
                }
            }
            
            if (!results) {
                results = response.data.result || response.data.results || response.data.list || (Array.isArray(response.data) ? response.data : null);
            }
        }

        if (results && Array.isArray(results) && results.length === 0) {
            await react("❌");
            return reply(`🛸 *No Results Found!*\nMovieBox par *"${q}"* naam ki koi movie nahi mili. Kripya sahi naam likhein.`);
        }

        if (!results || !Array.isArray(results)) {
            await react("❌");
            return reply(`🛸 *Parsing Error:* API format changed. Please contact developer.`);
        }

        let listText = `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        listText += `┃ 🎬  *MOVIEBOX SEARCH* 🎬 ┃\n`;
        listText += `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        listText += `🔎 *Query:* \`${q.toUpperCase()}\`\n`;
        listText += `✨ *Results Found:* ${results.length}\n\n`;
        listText += `┌─────────────────────────┐\n`;

        results.forEach((v, i) => {
            listText += `│ 🍿 *[${i + 1}]* _${v.title || v.name || 'Unknown Title'}_\n`;
            listText += `│ └─ 📅 *Type/Year:* ${v.type || 'Movie'} | ${v.year || 'N/A'}\n`;
            if (i !== results.length - 1) listText += `├─────────────────────────┤\n`;
        });

        listText += `└─────────────────────────┘\n\n`;
        listText += `⚡ *Reply with the item number* to view options.\n\n`;
        listText += `> *© KAMRAN-MINI-BOT ッ*`;

        const firstImage = results[0].image || results[0].poster || results[0].thumb || "https://placehold.co/600x400?text=No+Poster";

        const sentSearch = await client.sendMessage(from, {
            image: { url: firstImage },
            caption: listText
        }, { quoted: mek });

        const searchMsgId = sentSearch.key.id;
        let detailsTimeout, downloadTimeout;

        // ================= INTERACTIVE STEP: DETAILS HANDLER =================
        const detailsHandler = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg?.message || msg.key.remoteJid !== from) return;

                let rawMsg = msg.message;
                if (rawMsg.ephemeralMessage) rawMsg = rawMsg.ephemeralMessage.message;
                if (rawMsg.viewOnceMessage) rawMsg = rawMsg.viewOnceMessage.message;
                if (rawMsg.viewOnceMessageV2) rawMsg = rawMsg.viewOnceMessageV2.message;
                if (!rawMsg) return;

                const ctx = rawMsg.extendedTextMessage?.contextInfo;
                if (ctx?.stanzaId !== searchMsgId) return;

                const choice = (rawMsg.conversation || rawMsg.extendedTextMessage?.text || "").trim();
                const num = parseInt(choice);
                if (isNaN(num) || num < 1 || num > results.length) return;
                
                const selected = results[num - 1];
                if (!selected) return;

                client.ev.off(_0xdec(3), detailsHandler);
                clearTimeout(detailsTimeout);

                await react("⏳");

                const detailResponse = await axios.get(_0xdec(2), {
                    params: { 
                        apikey: _0xdec(0), 
                        subjectId: selected.subjectId || selected.id || selected.subject_id, 
                        detailPath: selected.detailPath || selected.path || selected.detail_path,
                        season: 0,
                        episode: 0
                    },
                    timeout: 30000
                });

                if (detailResponse.status !== 200 || !detailResponse.data) {
                    await react("❌");
                    return reply("❌ *Error:* Failed to pull download properties for this item.");
                }

                const movieDetails = detailResponse.data.data || detailResponse.data.result || detailResponse.data;
                
                let dlLinks = [];
                if (movieDetails) {
                    if (Array.isArray(movieDetails.downloads)) dlLinks = movieDetails.downloads;
                    else if (Array.isArray(movieDetails.streams)) dlLinks = movieDetails.streams;
                    else if (Array.isArray(movieDetails.links)) dlLinks = movieDetails.links;
                    else if (typeof movieDetails === 'object') {
                        for (let key in movieDetails) {
                            if (Array.isArray(movieDetails[key])) {
                                dlLinks = movieDetails[key];
                                break;
                            }
                        }
                    }
                }

                if (dlLinks.length === 0) {
                    await react("❌");
                    return reply("❌ *Sorry:* No downloadable mirrors were located for this selection.");
                }

                let cap = `╭──────────────◆\n`;
                cap += `│ 🎥 *${movieDetails.title || selected.title || selected.name}*\n`;
                cap += `╰──────────────◆\n\n`;
                cap += `🎭 *Type:* \`${movieDetails.type || 'Movie'}\`\n`;
                cap += `📅 *Year:* ${movieDetails.year || 'N/A'}\n\n`;
                if (movieDetails.description) {
                    cap += `📝 *Description:* \n_${movieDetails.description}_\n\n`;
                }
                
                cap += `┏───────────────────────┓\n`;
                cap += `│   💾  AVAILABLE MIRRORS   │\n`;
                cap += `┗───────────────────────┛\n`;
                
                dlLinks.forEach((dl, i) => {
                    cap += `╭─ 📥 *[${i + 1}]* Mirror ${i + 1}\n`;
                    cap += `├─ 🌟 *Quality:* \`${dl.quality || 'HD'}\`\n`;
                    cap += `╰─ ⚖️ *Size:* \`${dl.size || 'Unknown'}\`\n\n`;
                });

                cap += `⚡ *Reply with a mirror number* to start downloading.\n\n`;
                cap += `> *© KAMRAN-MINI-BOT ッ*`;

                const detailImg = movieDetails.image || movieDetails.poster || selected.image || "https://placehold.co/600x400?text=No+Poster";

                const sentDetail = await client.sendMessage(from, {
                    image: { url: detailImg },
                    caption: cap
                }, { quoted: msg });

                const detailMsgId = sentDetail.key.id;

                // ================= INTERACTIVE STEP: DOWNLOAD HANDLER =================
                const downloadHandler = async (up) => {
                    try {
                        const dlMsg = up.messages[0];
                        if (!dlMsg?.message || dlMsg.key.remoteJid !== from) return;

                        let dlRaw = dlMsg.message;
                        if (dlRaw.ephemeralMessage) dlRaw = dlRaw.ephemeralMessage.message;
                        if (dlRaw.viewOnceMessage) dlRaw = dlRaw.viewOnceMessage.message;
                        if (dlRaw.viewOnceMessageV2) dlRaw = dlRaw.viewOnceMessageV2.message;
                        if (!dlRaw) return;

                        const dlCtx = dlRaw.extendedTextMessage?.contextInfo;
                        if (dlCtx?.stanzaId !== detailMsgId) return;

                        const pick = (dlRaw.conversation || dlRaw.extendedTextMessage?.text || "").trim();
                        const dlNum = parseInt(pick);
                        if (isNaN(dlNum) || dlNum < 1 || dlNum > dlLinks.length) return;

                        const selectedDl = dlLinks[dlNum - 1];
                        if (!selectedDl) return;

                        client.ev.off(_0xdec(3), downloadHandler);
                        clearTimeout(downloadTimeout);

                        await client.sendMessage(from, { react: { text: "📥", key: dlMsg.key } });
                        
                        let targetFileUrl = selectedDl.direct || selectedDl.url || selectedDl.link || selectedDl.download || selectedDl.file;
                        
                        if (!targetFileUrl && typeof selectedDl === 'object') {
                            for (let key in selectedDl) {
                                if (typeof selectedDl[key] === 'string' && (selectedDl[key].startsWith('http://') || selectedDl[key].startsWith('https://'))) {
                                    targetFileUrl = selectedDl[key];
                                    break;
                                }
                            }
                        }

                        if (!targetFileUrl) {
                            await react("❌");
                            return reply("❌ *Error:* Direct download link could not be resolved from this mirror.");
                        }

                        const cleanFileName = `${(movieDetails.title || selected.title || selected.name || "Movie").replace(/[^a-zA-Z0-9 ]/g, "_")}_${selectedDl.quality || 'HD'}.mp4`;

                        await reply(`🚀 *Processing MovieBox File...* \nUploading document. Please wait!`);

                        let finalCaption = `╭───────────────────◆\n`;
                        finalCaption += `│ 🎬 *${movieDetails.title || selected.title || selected.name}*\n`;
                        finalCaption += `├───────────────────◆\n`;
                        finalCaption += `│ 🌟 *Quality:* ${selectedDl.quality || 'HD'}\n`;
                        finalCaption += `│ ⚖️ *Size:* ${selectedDl.size || 'N/A'}\n`;
                        finalCaption += `╰───────────────────◆\n\n`;
                        finalCaption += `> *© KAMRAN-MINI-BOT ッ*`;

                        const thumbBuffer = await getThumbnailBuffer(movieDetails.image || movieDetails.poster || selected.image);
                        
                        let documentPayload = {
                            document: { url: targetFileUrl },
                            mimetype: "video/mp4",
                            fileName: cleanFileName,
                            caption: finalCaption
                        };

                        if (thumbBuffer && Buffer.isBuffer(thumbBuffer)) {
                            documentPayload.jpegThumbnail = thumbBuffer;
                        }

                        await client.sendMessage(from, documentPayload, { quoted: dlMsg });
                        await client.sendMessage(from, { react: { text: "✅", key: dlMsg.key } });

                    } catch (dlErr) {
                        console.error("MovieBox download failed:", dlErr.message);
                        reply(`❌ An error occurred during file delivery: ${dlErr.message}`);
                    }
                };

                client.ev.on(_0xdec(3), downloadHandler);
                
                downloadTimeout = setTimeout(() => {
                    client.ev.off(_0xdec(3), downloadHandler);
                }, 300000);

            } catch (detErr) {
                console.error("MovieBox details failed:", detErr.message);
                reply(`❌ An error occurred while loading details: ${detErr.message}`);
            }
        };

        client.ev.on(_0xdec(3), detailsHandler);
        
        detailsTimeout = setTimeout(() => {
            client.ev.off(_0xdec(3), detailsHandler);
        }, 300000);

    } catch (e) {
        console.error("MovieBox Downloader error:", e.message);
        await react("❌");
        return reply(`❌ *Error Processing Request:* ${e.message}`);
    }
});
