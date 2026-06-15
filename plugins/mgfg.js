const axios = require("axios");
const { cmd } = require('../command');
const sharp = require("sharp");

async function getThumbnailBuffer(url) {
    if (!url) return null;
    try {
        const { data } = await axios.get(url, { responseType: "arraybuffer" });
        return await sharp(data).resize(300, 300).jpeg({ quality: 80 }).toBuffer();
    } catch (err) {
        return null;
    }
}

cmd({
    pattern: "movie",
    alias: ["mlfbd", "downloadmovie", "cinemalk"],
    desc: "Search and download movies from MLFBD",
    category: "downloader",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, react, socket }) => {
    const client = socket || conn;
    const apiKey = "vajira-VajiraOfficial2003";
    
    if (!q) return reply("❌ Please provide a movie name!");
    await reply(`🔍 Searching for "${q}"...`);

    try {
        const res = await axios.get(`https://vajira-official-apis.vercel.app/api/mlfbds`, { params: { apikey: apiKey, text: q } });
        const results = res.data?.result;
        if (!results?.length) return reply("❌ No results found.");

        let listText = `🎬 *MLFBD SEARCH*\n\n`;
        results.forEach((v, i) => listText += `*${i + 1}* ☛ ${v.title} (${v.year || 'N/A'})\n`);
        listText += `\n*Reply with a number to select.*`;

        const sentSearch = await client.sendMessage(from, { image: { url: results[0].image }, caption: listText }, { quoted: mek });

        // Event handler for selecting movie
        const detailsHandler = async (update) => {
            const msg = update.messages[0];
            if (!msg?.message || msg.key.remoteJid !== from) return;
            
            const stanzaId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
            if (stanzaId !== sentSearch.key.id) return;

            const num = parseInt(msg.message.conversation || msg.message.extendedTextMessage?.text);
            if (isNaN(num) || num < 1 || num > results.length) return;

            client.ev.off("messages.upsert", detailsHandler); // Cleanup
            await react("⏳");

            const selected = results[num - 1];
            const detailRes = await axios.get(`https://vajira-official-apis.vercel.app/api/mlfbddl`, { params: { apikey: apiKey, url: selected.link } });
            
            if (!detailRes.data?.result) return reply("❌ Failed to get details.");
            
            const movie = detailRes.data.result;
            let cap = `🎬 *${movie.title}*\n\n`;
            movie.downloads.forEach((dl, i) => cap += `*${i + 1}* ☛ Quality: [${dl.quality}]\n`);
            
            const sentDetail = await client.sendMessage(from, { image: { url: movie.image }, caption: cap }, { quoted: msg });

            // Event handler for downloading
            const downloadHandler = async (up) => {
                const dlMsg = up.messages[0];
                if (!dlMsg?.message || dlMsg.key.remoteJid !== from) return;
                if (dlMsg.message.extendedTextMessage?.contextInfo?.stanzaId !== sentDetail.key.id) return;

                const dlNum = parseInt(dlMsg.message.conversation || dlMsg.message.extendedTextMessage?.text);
                if (isNaN(dlNum) || dlNum < 1 || dlNum > movie.downloads.length) return;

                client.ev.off("messages.upsert", downloadHandler); // Cleanup
                await client.sendMessage(from, { react: { text: "📥", key: dlMsg.key } });

                await client.sendMessage(from, {
                    document: { url: movie.downloads[dlNum - 1].direct },
                    mimetype: "video/mp4",
                    fileName: `${movie.title.replace(/[^a-zA-Z0-9 ]/g, "_")}.mp4`,
                    jpegThumbnail: await getThumbnailBuffer(movie.image),
                    caption: `✅ Downloaded: ${movie.title}`
                }, { quoted: dlMsg });
            };

            client.ev.on("messages.upsert", downloadHandler);
        };

        client.ev.on("messages.upsert", detailsHandler);
        
        // Timeout cleanup (important)
        setTimeout(() => {
            client.ev.off("messages.upsert", detailsHandler);
        }, 60000);

    } catch (e) {
        await react("❌");
        reply("❌ Error: " + e.message);
    }
});
