const axios = require('axios');
const { cmd } = require('../command');
const config = require("../../config");
const sharp = require("sharp");

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
    pattern: "movie",
    alias: ["mlfbd", "downloadmovie", "cinemalk"],
    category: "downloader",
    filename: __filename,
    description: "Search and download movies from MLFBD via API",
    use: '.movie <movie name>',
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    
    const client = conn; 
    const react = async (emoji) => {
        await client.sendMessage(from, { react: { text: emoji, key: mek.key } });
    };

    const apiKey = "vajira-VajiraOfficial2003";
    const searchApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbds`;
    const downloadApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbddl`;

    try {
        await react("🎬");

        if (!q) {
            return reply(
                "❌ Please provide a movie name to search!\n\n" +
                "Example: .movie From Season 4\n" +
                "Or: .movie Drishyam 3"
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

        listText += `*🔢 Reply with a number to select your choice*\n\n> © KAMRAN-MINI-BOT ッ`;

        await client.sendMessage(from, {
            image: { url: results[0].image || "https://placehold.co/600x400?text=No+Poster" },
            caption: listText
        }, { quoted: mek });

        // Timeouts reference variables
        let detailsTimeout, downloadTimeout;

        // ================= INTERACTIVE STEP: DETAILS HANDLER =================
        const detailsHandler = async (update) => {
            const msg = update.messages[0];
            if (!msg?.message || msg.key.remoteJid !== from || msg.key.fromMe) return;

            // Simple text extraction (No strict Stanza ID check to avoid getting stuck)
            const choice = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const num = parseInt(choice);
            
            // Agar input valid number nahi hai toh ignore karein taaki normal chat chalti rahe
            if (isNaN(num) || num < 1 || num > results.length) return;
            
            const selected = results[num - 1];
            if (!selected) return;

            // Listener aur timeout clear karein taaki double execute na ho
            client.ev.off("messages.upsert", detailsHandler);
            clearTimeout(detailsTimeout);

            await client.sendMessage(from, { react: { text: "⏳", key: msg.key } });

            try {
                const detailResponse = await axios.get(downloadApiUrl, {
                    params: { apikey: apiKey, url: selected.link },
                    timeout: 45000 // API late response deti hai isliye timeout barha diya
                });

                if (detailResponse.status !== 200 || !detailResponse.data || !detailResponse.data.result) {
                    await client.sendMessage(from, { react: { text: "❌", key: msg.key } });
                    return reply("❌ Failed to pull download properties for this item. API might be slow.");
                }

                const movieDetails = detailResponse.data.result;
                const dlLinks = movieDetails.downloads || [];

                if (dlLinks.length === 0) {
                    await client.sendMessage(from, { react: { text: "❌", key: msg.key } });
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
                cap += `*🔢 Reply a number to begin download submission*\n\n> © KAMRAN-MINI-BOT ッ`;

                await client.sendMessage(from, {
                    image: { url: movieDetails.image || selected.image || "https://placehold.co/600x400?text=No+Poster" },
                    caption: cap
                }, { quoted: msg });

                // ================= INTERACTIVE STEP: DOWNLOAD HANDLER =================
                const downloadHandler = async (up) => {
                    const dlMsg = up.messages[0];
                    if (!dlMsg?.message || dlMsg.key.remoteJid !== from || dlMsg.key.fromMe) return;

                    const pick = (dlMsg.message.conversation || dlMsg.message.extendedTextMessage?.text || "").trim();
                    const dlNum = parseInt(pick);
                    if (isNaN(dlNum) || dlNum < 1 || dlNum > dlLinks.length) return;

                    const selectedDl = dlLinks[dlNum - 1];
                    if (!selectedDl) return;

                    client.ev.off("messages.upsert", downloadHandler);
                    clearTimeout(downloadTimeout);

                    await client.sendMessage(from, { react: { text: "📥", key: dlMsg.key } });
                    
                    const targetFileUrl = selectedDl.direct;
                    const cleanFileName = `${(movieDetails.title || selected.title).replace(/[^a-zA-Z0-9 ]/g, "_")}_${selectedDl.quality || '720p'}.mp4`;

                    await reply(`🚀 Processing your movie file request... Sending Document now.`);

                    try {
                        await client.sendMessage(from, {
                            document: { url: targetFileUrl },
                            mimetype: "video/mp4",
                            fileName: cleanFileName,
                            jpegThumbnail: await getThumbnailBuffer(movieDetails.image || selected.image),
                            caption: `🎬 *${movieDetails.title || selected.title}*\n⚖️ *Size:* ${selectedDl.size || 'N/A'}\n🌟 *Quality:* ${selectedDl.quality || '720p'}\n\n> © KAMRAN-MINI-BOT ッ`
                        }, { quoted: dlMsg });

                        await client.sendMessage(from, { react: { text: "✅", key: dlMsg.key } });
                    } catch (dlErr) {
                        console.error("Download Link Sending Error:", dlErr.message);
                        reply(`❌ Error sending file. The direct link might be expired or too heavy.`);
                    }
                };

                client.ev.on("messages.upsert", downloadHandler);
                
                downloadTimeout = setTimeout(() => {
                    client.ev.off("messages.upsert", downloadHandler);
                }, 300000);

            } catch (apiErr) {
                console.error("API Detail Error:", apiErr.message);
                await client.sendMessage(from, { react: { text: "❌", key: msg.key } });
                reply("❌ API server ne response nahi diya. Please try again later.");
            }
        };

        client.ev.on("messages.upsert", detailsHandler);
        
        detailsTimeout = setTimeout(() => {
            client.ev.off("messages.upsert", detailsHandler);
        }, 300000);

    } catch (e) {
        console.error("MLFBD Downloader error:", e.message);
        await react("❌");
        return reply(`❌ Error processing your request: ${e.message}`);
    }
});
