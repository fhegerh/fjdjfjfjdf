const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "download",
    alias: ["aio", "dl"],
    desc: "Download media dari berbagai platform via URL",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
    try {
        // 1. Validasi apakah user memasukkan URL
        if (!q) return reply("Silahkan masukkan URL yang ingin di-download!\nContoh: .download https://youtu.be/xxxx");

        // Memberikan tanda bahwa bot sedang memproses
        await reply("Tunggu sebentar, sedang memproses data...");

        // 2. Mengambil URL dari input user (q) dan melakukan encode agar aman di API
        const targetUrl = q.trim();
        const apiUrl = `https://api.ikyyxd.my.id/download/all-in-one?url=${encodeURIComponent(targetUrl)}`;

        // 3. Fetch data dari API
        const response = await axios.get(apiUrl);
        const res = response.data;

        // 4. Validasi respon dari API (sesuaikan dengan struktur JSON asli API-mu)
        if (!res || res.status !== true) {
            return reply("Gagal mengambil data. Pastikan URL yang kamu masukkan valid.");
        }

        const hasil = res.result; // Menampung objek hasil download
        
        // Buat teks caption untuk dikirim bersama media
        let caption = `*✨ DOWNLOADER SUCCESS ✨*\n\n`;
        caption += `📝 *Judul:* ${hasil.title || 'Tidak diketahui'}\n`;
        caption += `🔗 *Source:* ${targetUrl}\n`;

        // 5. Proses pengiriman media (Contoh jika API mengembalikan link video/audio)
        // Note: Sesuaikan property 'hasil.url' atau 'hasil.video' dengan response asli API kamu
        const mediaUrl = hasil.url || hasil.video || hasil.link;

        if (mediaUrl) {
            await conn.sendMessage(from, { 
                video: { url: mediaUrl }, 
                caption: caption 
            }, { quoted: mek });
        } else {
            // Jika tidak ada media langsung, bot akan mengirimkan teks hasil object-nya
            reply(JSON.stringify(hasil, null, 2));
        }

    } catch (error) {
        console.error(error);
        reply("Terjadi kesalahan sistem atau API sedang down. Silahkan coba lagi nanti.");
    }
});
