const axios = require("axios");
const config = require("../config");
const { cmd } = require('../command');
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
    desc: "Search and download movies from MLFBD via API",
    category: "downloader",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, react, socket }) => {
    const client = socket || conn;
    const apiKey = "vajira-VajiraOfficial2003";
    const searchApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbds`;
    const downloadApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbddl`;

    try {
        if (!q) {
            return reply("❌ Please provide a movie name to search!\n\nExample: .movie From Season 4");
        }

        await reply(`🔍 Searching for "${q}" on MLFBD...`);

        const response = await axios.get(searchApiUrl, {
            params: { apikey: apiKey, text: q },
            timeout: 30000
        });

        if (response.status !== 200 || !response.data?.result?.length) {
            await react("❌");
            return reply("❌ No results found on MLFBD for your query.");
        }

        const results = response.data.result;
        let listText = `🎬 *MLFBD MOVIE SEARCH*\n\n🔎 *Query:* ${q.toUpperCase()}\n\n`;
        results.forEach((v, i) => {
            listText += `*${i + 1}* ☛ ${v.title} \n⭐ Rating: [${v.rate || 'N/A'}] | Year: [${v.year || 'N/A'}]\n\n`;
        });
        listText += `*🔢 Reply with a number to select your choice*\n\n> © KAMRAN-MINI-BOT ッ`;

        const sentSearch = await client.sendMessage(from, {
            image: { url: results[0].image || "https://placehold.co/600x400?text=No+Poster" },
            caption: listText
        }, { quoted: mek });

        const searchMsgId = sentSearch.key.id;
        let detailsTimeout;

        const detailsHandler = async (update) => {
            const msg = update.messages[0];
            if (!msg?.message || msg.key.remoteJid !== from) return;

            const ctx = msg.message.extendedTextMessage?.contextInfo || msg.message.conversation?.contextInfo;
            if (ctx?.stanzaId !== searchMsgId) return;

            const choice = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const num = parseInt(choice);
            if (isNaN(num) || num < 1 || num > results.length) return;

            client.ev.off("messages.upsert", detailsHandler);
            clearTimeout(detailsTimeout);

            await react("⏳");
            const selected = results[num - 1];
            const detailResponse = await axios.get(downloadApiUrl, {
                params: { apikey: apiKey, url: selected.link },
                timeout: 30000
            });

            if (!detailResponse.data?.result) return reply("❌ Failed to pull details.");

            const movieDetails = detailResponse.data.result;
            const dlLinks = movieDetails.downloads || [];
            let cap = `🎬 *${movieDetails.title}*\n\nℹ️ *Description:* ${movieDetails.description || 'N/A'}\n\n`;
            dlLinks.forEach((dl, i) => {
                cap += `*${i + 1}* ☛ Mirror ${i + 1} - Quality: [${dl.quality || '720p'}]\n`;
            });
            cap += `\n*🔢 Reply a number to begin download*\n\n> © KAMRAN-MINI-BOT ッ`;

            const sentDetail = await client.sendMessage(from, {
                image: { url: movieDetails.image || selected.image },
                caption: cap
            }, { quoted: msg });

            const detailMsgId = sentDetail.key.id;

            const downloadHandler = async (up) => {
                const dlMsg = up.messages[0];
                if (dlMsg?.key.remoteJid !== from || dlMsg.message.extendedTextMessage?.contextInfo?.stanzaId !== detailMsgId) return;

                const dlNum = parseInt((dlMsg.message.conversation || dlMsg.message.extendedTextMessage?.text || "").trim());
                if (isNaN(dlNum) || dlNum < 1 || dlNum > dlLinks.length) return;

                client.ev.off("messages.upsert", downloadHandler);
                await client.sendMessage(from, { react: { text: "📥", key: dlMsg.key } });

                await client.sendMessage(from, {
                    document: { url: dlLinks[dlNum - 1].direct },
                    mimetype: "video/mp4",
                    fileName: `${movieDetails.title.replace(/[^a-zA-Z0-9 ]/g, "_")}.mp4`,
                    jpegThumbnail: await getThumbnailBuffer(movieDetails.image),
                    caption: `✅ Downloaded: ${movieDetails.title}`
                }, { quoted: dlMsg });
            };

            client.ev.on("messages.upsert", downloadHandler);
        };

        client.ev.on("messages.upsert", detailsHandler);
        detailsTimeout = setTimeout(() => client.ev.off("messages.upsert", detailsHandler), 300000);

    } catch (e) {
        console.error(e);
        await react("❌");
        reply("❌ Error: " + e.message);
    }
});
