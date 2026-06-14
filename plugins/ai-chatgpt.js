const axios = require("axios"); // Menggunakan axios agar lebih stabil dibanding node-fetch
const { cmd } = require("../command");

cmd({
  pattern: "tiktoksearch",
  alias: ["tiktoks", "tiks", "tiks2"],
  desc: "Search for TikTok videos using a query.",
  category: 'tools',
  filename: __filename
}, async (conn, mek, m, { from, args }) => {
  
  // Menggabungkan argument menjadi satu string pencarian
  const query = args.join(" ");

  // Validasi jika user lupa memasukkan kata kunci
  if (!query) {
    return conn.sendMessage(from, { text: "🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktoksearch Dr Kamran" }, { quoted: mek });
  }

  try {
    // 1. Mengirim status pencarian awal menggunakan core Baileys sendMessage
    await conn.sendMessage(from, { text: `🔎 Searching TikTok for: *${query}*...` }, { quoted: mek });
    
    // 2. Request data ke API Starlights Team yang kamu berikan
    const apiUrl = `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    const res = response.data;

    // 3. Validasi Response (Sesuai gambar: status harus 200 dan data memiliki isi array)
    if (!res || res.status !== 200 || !res.data || res.data.length === 0) {
      return conn.sendMessage(from, { text: "❌ No results found for your query. Please try with a different keyword." }, { quoted: mek });
    }

    // 4. Mengambil hasil video pertama (index 0) dari array data agar proses kirim instan
    const video = res.data[0];

    // Menyusun caption informasi video sesuai property yang ada di gambar JSON
    const message = `🌸 *TikTok Video Result*:\n\n`
      + `*• Title*: ${video.title || 'No Title'}\n`
      + `*• Author*: ${video.author || 'Unknown'}\n`
      + `*• Region*: ${video.region || 'Unknown'}\n`
      + `*• Duration*: ${video.duration ? video.duration + 's' : 'Unknown'}\n`
      + `*• URL*: ${video.url || 'No Link'}\n\n`
      + `_Sending video file, please wait..._`;

    // 5. Mengirim file video menggunakan property "nowm" (No Watermark) dari JSON kamu
    if (video.nowm) {
      await conn.sendMessage(from, {
        video: { url: video.nowm },
        caption: message
      }, { quoted: mek });
    } else {
      await conn.sendMessage(from, { text: `❌ Link video No-Watermark tidak ditemukan untuk hasil ini.` }, { quoted: mek });
    }

  } catch (error) {
    // Menampilkan log error asli di terminal server/CMD agar kamu bisa memantau
    console.log("============== ERROR LOG ==============");
    console.error(error);
    console.log("=======================================");
    
    // Pesan error ramah ke user WhatsApp jika ada kendala jaringan internal bot
    await conn.sendMessage(from, { text: "❌ An error occurred while processing your request. Please try зgain." }, { quoted: mek });
  }
});
