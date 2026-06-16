const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "dl", // Command name
    alias: ["download"],
    desc: "Download media dari berbagai platform (IG, TikTok, FB, YT)",
    category: "downloader",
    filename: __filename
}, async (conn, m, { text, reply }) => {
    
    if (!text) return reply('Harap masukkan link media yang ingin didownload.');

    await reply('⏳ Sedang memproses link...');

    try {
        // API URL for AIO Downloader
        const api = `https://api.mifinfinity.my.id/api/downloader/aio-v2?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(api);

        if (!data.status || !data.result) {
            return reply('Gagal mengambil data. Pastikan link benar.');
        }

        const res = data.result;

        // Mendeteksi jenis media (Video/Audio)
        if (res.type === 'video') {
            await conn.sendMessage(m.chat, { 
                video: { url: res.download }, 
                caption: `乂 *A I O - D O W N L O A D E R*\n\n◦ *Title*: ${res.title || 'N/A'}` 
            }, { quoted: m });
        } else if (res.type === 'audio') {
            await conn.sendMessage(m.chat, { 
                audio: { url: res.download }, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m });
        } else {
            reply('Tipe media tidak didukung.');
        }

    } catch (e) {
        console.error(e);
        reply('Terjadi kesalahan saat mendownload media.');
    }
});
