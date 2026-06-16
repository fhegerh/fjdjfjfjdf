const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd({
    pattern: "play5",
    alias: ["play4"],
    desc: "Memutar musik dari YouTube",
    category: "downloader",
    filename: __filename
}, async (m, { sock, text, reply, example }) => {
    
    if (!text) return reply(example('dj tiktok viral'));

    await reply('⏳ Sedang mencari lagu...');

    try {
        const search = await yts(text);
        const video = search.videos[0];

        if (!video) return reply('Lagu tidak ditemukan.');

        const api = `https://api.mifinfinity.my.id/api/downloader/youtube?url=${encodeURIComponent(video.url)}&type=audio`;

        const { data } = await axios.get(api);

        if (!data.status || !data.result?.download) {
            return reply('Gagal mengambil audio.');
        }

        const res = data.result;

        let caption = `乂 *Y O U T U B E - P L A Y*\n\n`;
        caption += `◦ *Title* : ${res.title}\n`;
        caption += `◦ *Channel* : ${res.channel}\n`;
        caption += `◦ *Duration* : ${res.duration}\n`;
        caption += `◦ *Views* : ${res.views}\n`;
        caption += `◦ *Size* : ${res.size}\n`;

        await sock.sendMessage(m.chat, {
            image: { url: res.thumbnail },
            caption
        }, { quoted: m });

        await sock.sendMessage(m.chat, {
            audio: { url: res.download },
            mimetype: 'audio/mpeg',
            fileName: `${res.title}.mp3`,
            ptt: false
        }, { quoted: m });

    } catch (e) {
        console.log(e);
        reply('Terjadi kesalahan saat mendownload audio.');
    }
});
