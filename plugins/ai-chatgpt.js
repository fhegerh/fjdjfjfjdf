const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "vcc",
    alias: ["vccgen", "vccgenerator"],
    desc: "Generate Virtual Credit Card (VCC) berdasarkan tipe (visa/mastercard)",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
    try {
        // 1. Ambil input tipe dari user, jika kosong default ke 'visa'
        let type = q.trim().toLowerCase();
        if (!type) type = 'visa'; // Default jika user hanya mengetik .vcc

        // Validasi tipe yang didukung oleh API (opsional, untuk mencegah error)
        const allowedTypes = ['visa', 'mastercard', 'amex', 'discover'];
        if (!allowedTypes.includes(type)) {
            return reply(`Tipe kartu tidak didukung!\nTipe yang tersedia: *${allowedTypes.join(', ')}*`);
        }

        await reply(`Sedang men-generate VCC (*${type.toUpperCase()}*), mohon tunggu...`);

        // 2. Fetch ke API David Cyril Tech sesuai endpoint baru
        const apiUrl = `https://apis.davidcyriltech.my.id/tools/vcc-generator?type=${type}`;
        const response = await axios.get(apiUrl);
        const res = response.data;

        // 3. Validasi respon sukses dari API
        // Catatan: Jika API langsung mengembalikan data tanpa property 'status', sesuaikan kondisi di bawah ini
        if (!res) {
            return reply("Gagal mengambil data dari server API.");
        }

        // Mengambil data kartu (sesuaikan dengan struktur JSON yang keluar di console.log)
        // Umumnya berupa object tunggal atau list di dalam property 'result' atau langsung di root object
        const card = res.result || res; 

        // 4. Menyusun template teks hasil untuk dikirim ke WhatsApp
        let teksHasil = `*💳 VCC GENERATOR SUCCESS 💳*\n\n`;
        teksHasil += `➔ *Type:* ${type.toUpperCase()}\n`;
        teksHasil += `➔ *Brand:* ${card.brand || card.type || type.toUpperCase()}\n`;
        teksHasil += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Format standar copy-paste (Nomor|Bulan|Tahun|CVV) dibungkus dengan backtick agar monospace
        teksHasil += `🔹 *Card Data:* \n`;
        teksHasil += `\`${card.number || card.cc || card.creditCardNumber || ''}|${card.month || card.mm || card.exp_month || ''}|${card.year || card.yy || card.exp_year || ''}|${card.cvv || card.cvc || ''}\`\n\n`;
        
        // Detail tambahan jika ada di dalam response API
        if (card.holder || card.name) teksHasil += `👤 *Holder:* ${card.holder || card.name}\n`;
        if (card.country) teksHasil += `🌍 *Country:* ${card.country}\n`;
        
        teksHasil += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        teksHasil += `_Klik pada teks kotak di atas untuk menyalin data kartu._`;

        // 5. Kirim hasil akhir ke chat
        await reply(teksHasil);

    } catch (error) {
        console.error(error);
        reply("Terjadi kesalahan sistem atau API David Cyril Tech sedang down.");
    }
});
