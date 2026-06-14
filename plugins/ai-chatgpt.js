const fetch = require("node-fetch");
const { cmd } = require("../command");

cmd({
  pattern: "tiktoksearch",
  alias: ["tiktoks", "tiks2"],
  desc: "Search for TikTok videos using a query.",
  category: 'tools',
  filename: __filename
}, async (conn, mek, m, { from, args }) => {
  
  // Ambil query dari argument
  const query = args.join(" ");

  // Validasi jika user tidak memasukkan kata kunci
  if (!query) {
    return conn.sendMessage(from, { text: "🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktoksearch <query>" }, { quoted: mek });
  }

  try {
    // Mengirim pesan loading menggunakan conn.sendMessage langsung
    await conn.sendMessage(from, { text: `🔎 Searching TikTok for: *${query}*...` }, { quoted: mek });
    
    // Fetch data ke API
    const response = await fetch(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`);
    const data = await response.json();

    // Validasi data response API sesuai gambar ke-2
    if (!data || data.status !== 200 || !data.data || data.data.length === 0) {
      return conn.sendMessage(from, { text: "❌ No results found for your query. Please try with a different keyword." }, { quoted: mek });
    }

    // Kita batasi ambil 1 atau 2 video saja dulu untuk test agar tidak berat
    const results = data.data.slice(0, 2);

    for (const video of results) {
      const message = `🌸 *TikTok Video Result*:\n\n`
        + `*• Title*: ${video.title || 'No Title'}\n`
        + `*• Author*: ${video.author || 'Unknown'}\n`
        + `*• Duration*: ${video.duration ? video.duration + 's' : "Unknown"}\n`
        + `*• URL*: ${video.url || 'No Link'}\n\n`;

      // Kirim video tanpa watermark menggunakan property 'video.nowm' dari API
      if (video.nowm) {
        await conn.sendMessage(from, {
          video: { url: video.nowm },
          caption: message
        }, { quoted: mek });
      } else {
        await conn.sendMessage(from, { text: `❌ Failed to retrieve video file for *"${video.title}"*.` }, { quoted: mek });
      }
    }

  } catch (error) {
    // Ini akan memunculkan error asli di terminal/cmd biar kamu bisa lihat detail rusaknya di mana
    console.log("====== ERROR TIKTOK SEARCH ======");
    console.error(error);
    console.log("=================================");
    
    // Kirim pesan error ke user WhatsApp
    await conn.sendMessage(from, { text: "❌ An error occurred while searching TikTok. Please try again later." }, { quoted: mek });
  }
});
