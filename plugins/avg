const { cmd } = require('../command');
const axios = require("axios");
const config = require('../config');
const Seedr = require('seedr');

const API_BASE = "https://vajira-official-apis.vercel.app/api";
const API_KEY = "vajira-VajiraOfficial2003";

// Seedr Credentials - updated
const seedrConfig = {
    email: "drkamran8309@gmail.com",
    password: "kamram00#"
};

cmd({
    pattern: "sublk",
    desc: "Search and download movies via SubLK and Seedr",
    category: "download",
    react: "🎬",
    use: ".sublk [movie name]",
    filename: __filename
},
async (socket, msg, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Usage:.sublk <movie name>");
        await socket.sendMessage(from, { react: { text: "🔍", key: mek.key } });

        const { data: searchRes } = await axios.get(`${API_BASE}/sublk?apikey=${API_KEY}&q=${encodeURIComponent(q)}`);
        if (!searchRes.status ||!searchRes.data.length) return reply("❌ No results found.");

        const list = searchRes.data.slice(0, 10);
        let text = `🎬 *ꜰʟᴇxᴀ ᴍᴏᴠɪᴇ ꜱᴇᴀʀᴄʜ*\n\n`;
        list.forEach((m, i) => { text += `*${i + 1}.* ${m.title}\n`; });
        text += `\n📥 *Reply with the number to select*`;

        const sent = await socket.sendMessage(from, { text }, { quoted: mek });

        const handler = async (up) => {
            const incoming = up.messages?.[0];
            if (!incoming?.message || incoming.key.remoteJid!== from) return;
            if (incoming.message.extendedTextMessage?.contextInfo?.stanzaId!== sent.key.id) return;

            const index = parseInt(incoming.message.conversation || incoming.message.extendedTextMessage?.text);
            if (isNaN(index) ||!list[index - 1]) return;

            socket.ev.off("messages.upsert", handler);
            const selected = list[index - 1];

            const { data: detailRes } = await axios.get(`${API_BASE}/sublkdl?apikey=${API_KEY}&url=${encodeURIComponent(selected.url)}`);
            const movie = detailRes.data;

            if (!movie.torrents?.length) return reply("❌ No torrents found.");

            let qText = `🎬 *${movie.title.toUpperCase()}*\n\n` +
                        `📅 *Date:* ${movie.date}\n` +
                        `⭐ *IMDb:* ${movie.imdbRate}\n` +
                        `🎭 *Genres:* ${movie.genres.join(", ")}\n\n` +
                        `📥 *Select Quality to Download:*\n`;
            movie.torrents.forEach((t, i) => { qText += `*${i + 1}.* ${t.quality} (${t.size})\n`; });
            qText += `\n> *${config.BOT_NAME || 'KAMRAN-MD'}*`;

            const infoMsg = await socket.sendMessage(from, { image: { url: movie.image }, caption: qText }, { quoted: incoming });

            const dlHandler = async (up2) => {
                const incoming2 = up2.messages?.[0];
                if (!incoming2?.message || incoming2.key.remoteJid!== from) return;
                if (incoming2.message.extendedTextMessage?.contextInfo?.stanzaId!== infoMsg.key.id) return;

                const choice = parseInt(incoming2.message.conversation || incoming2.message.extendedTextMessage?.text);
                if (isNaN(choice) ||!movie.torrents[choice - 1]) return;

                socket.ev.off("messages.upsert", dlHandler);
                const torrent = movie.torrents[choice - 1];
                await socket.sendMessage(from, { react: { text: "⏳", key: incoming2.key } });

                try {
                    await reply("📥 *Adding to Seedr cloud...*");

                    const seedr = new Seedr();
                    await seedr.login(seedrConfig.email, seedrConfig.password);

                    const hashMatch = torrent.url.match(/([a-fA-F0-9]{40})/);
                    if (!hashMatch) throw new Error("Could not extract hash.");

                    const magnet = `magnet:?xt=urn:btih:${hashMatch[1]}&dn=${encodeURIComponent(movie.title)}`;
                    await seedr.addMagnet(magnet);

                    await new Promise(r => setTimeout(r, 5000));

                    let fileInfo = null;
                    let folderId = null;

                    for (let i = 0; i < 30; i++) {
                        const files = await seedr.getVideos();
                        if (files?.[0]?.length > 0) {
                            folderId = files[0][0].fid;
                            fileInfo = await seedr.getFile(files[0][0].id);
                            break;
                        }
                        await new Promise(r => setTimeout(r, 5000));
                    }

                    if (!fileInfo ||!fileInfo.url) throw new Error("Seedr failed to prepare the file (or torrent has no seeds).");

                    await socket.sendMessage(from, {
                        document: { url: fileInfo.url },
                        mimetype: "video/mp4",
                        fileName: `${movie.title} [${torrent.quality}].mp4`,
                        caption: `🎬 *${movie.title}*\n📦 *Quality:* ${torrent.quality}\n\n> *${config.BOT_NAME || 'KAMRAN-MD'}*`
                    }, { quoted: incoming2 });

                    await seedr.deleteFolder(folderId);

                } catch (e) {
                    reply("❌ Seedr Error: " + e.message);
                }
            };
            socket.ev.on("messages.upsert", dlHandler);
        };
        socket.ev.on("messages.upsert", handler);
        setTimeout(() => socket.ev.off("messages.upsert", handler), 300000);
    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});
