const axios = require("axios");
const { cmd } = require("../command");
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
},
async (conn, mek, m, { from, q, reply, react }) => {
    const apiKey = "vajira-23ikssig51-1780651873767";
    const searchApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbds`;
    const downloadApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbddl`;

    try {
        if (!q) return reply("❌ Please provide a movie name to search!\n\nExample: .movie From Season 4");

        await reply(`🔍 Searching for "${q}" on MLFBD...`);

        const response = await axios.get(searchApiUrl, {
            params: { apikey: apiKey, text: q },
            timeout: 30000
        });

        if (!response.data?.result?.length) return reply("❌ No results found.");

        const results = response.data.result;
        let listText = `🎬 *MLFBD MOVIE SEARCH*\n\n🔎 *Query:* ${q.toUpperCase()}\n\n`;
        results.forEach((v, i) => {
            listText += `*${i + 1}* ☛ ${v.title} \n⭐ Rating: [${v.rate || 'N/A'}] | Year: [${v.year || 'N/A'}]\n\n`;
        });
        listText += `*🔢 Reply with a number to select your choice*\n\n> © KAMRAN-MINI-BOT ッ`;

        const sentSearch = await conn.sendMessage(from, {
            image: { url: results[0].image || "https://placehold.co/600x400?text=No+Poster" },
            caption: listText
        }, { quoted: mek });

        const searchMsgId = sentSearch.key.id;

        // Handler for selection
        const handler = async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || msg.key.remoteJid !== from) return;
            
            const quoted = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
            if (quoted !== searchMsgId) return;

            const choice = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const num = parseInt(choice);
            if (isNaN(num) || num < 1 || num > results.length) return;

            conn.ev.off("messages.upsert", handler); // Remove listener
            const selected = results[num - 1];
            
            await reply("⏳ Fetching details...");

            const detailResponse = await axios.get(downloadApiUrl, {
                params: { apikey: apiKey, url: selected.link },
                timeout: 30000
            });

            const movieDetails = detailResponse.data.result;
            const dlLinks = movieDetails.downloads || [];

            if (!dlLinks.length) return reply("❌ No download links found.");

            let cap = `🎬 *${movieDetails.title}*\n\n📂 *Available Mirrors:*\n`;
            dlLinks.forEach((dl, i) => {
                cap += `*${i + 1}* ☛ Mirror ${i + 1} [${dl.quality || '720p'}] (${dl.size})\n`;
            });
            cap += `\n*🔢 Reply number to download*`;

            const sentDetail = await conn.sendMessage(from, {
                image: { url: movieDetails.image || selected.image },
                caption: cap
            }, { quoted: msg });

            // Nested handler for download choice
            const dlHandler = async (up) => {
                const dlMsg = up.messages[0];
                if (!dlMsg.message || dlMsg.key.remoteJid !== from) return;
                if (dlMsg.message.extendedTextMessage?.contextInfo?.stanzaId !== sentDetail.key.id) return;

                const pick = parseInt((dlMsg.message.conversation || dlMsg.message.extendedTextMessage?.text || "").trim());
                if (isNaN(pick) || pick < 1 || pick > dlLinks.length) return;

                conn.ev.off("messages.upsert", dlHandler);
                await reply("🚀 Downloading...");

                await conn.sendMessage(from, {
                    document: { url: dlLinks[pick - 1].direct },
                    mimetype: "video/mp4",
                    fileName: `${movieDetails.title}.mp4`,
                    jpegThumbnail: await getThumbnailBuffer(movieDetails.image),
                    caption: `✅ Downloaded: ${movieDetails.title}`
                }, { quoted: dlMsg });
            };

            conn.ev.on("messages.upsert", dlHandler);
        };

        conn.ev.on("messages.upsert", handler);

    } catch (e) {
        console.error(e);
        reply("❌ Error: " + e.message);
    }
});
