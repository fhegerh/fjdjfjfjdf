const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd({
    pattern: "play4",
    alias: ["play5"],
    desc: "Memutar musik dari YouTube",
    category: "downloader",
    filename: __filename
}, async (conn, m, { text, example }) => { // Yahan maine conn ko alag parameter banaya hai
    
    // Agar 'conn' undefined hai, toh 'm.client' ya 'm._client' use karein
    const sock = conn || m.client || m._client;

    if (!sock) {
        console.log("Error: Socket/Client nahi mil raha.");
        return;
    }

    // Manual reply function
    const reply = async (teks) => {
        return await sock.sendMessage(m.chat, { text: teks }, { quoted: m });
    };

    if (!text) return await reply('Contoh: .play dj tiktok viral');

    await reply('⏳ Sedang mencari lagu...');

    try {
        const search = await yts(text);
        const video = search.videos[0];

        if (!video) return await reply('Lagu tidak ditemukan.');

        const api = `https://api.mifinfinity.my.id/api/downloader/youtube?url=${encodeURIComponent(video.url)}&type=audio`;

        const { data } = await axios.get(api);

        if (!data.status || !data.result?.download) {
            return await reply('Gagal mengambil audio.');
        }

        const res = data.result;

        // Message bhejte waqt direct 'sock' use karein
        await sock.sendMessage(m.chat, {
            image: { url: res.thumbnail },
            caption: `乂 *Y O U T U B E - P L A Y*\n\n◦ *Title* : ${res.title}\n◦ *Channel* : ${res.channel}\n◦ *Duration* : ${res.duration}\n`
        }, { quoted: m });

        await sock.sendMessage(m.chat, {
            audio: { url: res.download },
            mimetype: 'audio/mpeg',
            fileName: `${res.title}.mp3`,
            ptt: false
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await reply('Terjadi kesalahan.');
    }
});
