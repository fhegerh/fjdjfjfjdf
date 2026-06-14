const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "vcc",
    alias: ["vccgen", "cardgen"],
    desc: "Generate Virtual Credit Card (VCC) berdasarkan BIN",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
    try {
        // 1. Validasi input BIN dari user
        if (!q) return reply("Silahkan masukkan nomor BIN (6 digit awal kartu)!\nContoh: .vcc 414720");

        const bin = q.trim();
        
        // Validasi agar yang dimasukkan harus berupa angka
        if (isNaN(bin)) return reply("BIN harus berupa angka saja!");

        await reply("Sedang men-generate VCC, mohon tunggu...");

        // 2. Fetch ke API David Cyril Tech
        const apiUrl = `https://apis.davidcyriltech.my.id/ai/vcc?bin=${bin}`; // Sesuaikan endpoint jika berbeda
        const response = await axios.get(apiUrl);
        const res = response.data;

        // 3. Membaca data response dari API
        // Catatan: Umumnya API VCC mengembalikan array berisi list kartu yang di-generate
        if (!res || res.status !== true || !res.result) {
            return reply("Gagal men-generate VCC. Pastikan nomor BIN benar atau coba BIN lain.");
        }

        const cards = res.result; // Biasanya berupa Array data kartu

        let teksHasil = `*💳 VCC GENERATOR SUCCESS 💳*\n\n`;
        teksHasil += `📌 *BIN:* ${bin}\n`;
        teksHasil += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Jika response berbentuk Array (banyak kartu)
        if (Array.isArray(cards)) {
            cards.forEach((card, index) => {
                teksHasil += `*${index + 1}.* \`${card.number || card.cc}|${card.month || card.mm}|${card.year || card.yy}|${card.cvv}\`\n`;
            });
        } else if (typeof cards === 'object') {
            // Jika response hanya 1 object kartu
            teksHasil += `➔ *Card:* \`${cards.number || cards.cc}|${cards.month || cards.mm}|${cards.year || cards.yy}|${cards.cvv}\`\n`;
        } else {
            // Jika response langsung berbentuk teks mentah
            teksHasil += cards;
        }

        teksHasil += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        teksHasil += `_Format: Nomor|Bulan|Tahun|CVV_`;

        // 4. Kirim hasil akhir ke user
        await reply(teksHasil);

    } catch (error) {
        console.error(error);
        reply("Terjadi kesalahan sistem atau API David Cyril Tech sedang down.");
    }
});
