const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "tiktoksearch",
  alias: ["tiktoks", "tiks", "tiks2"],
  desc: "Search for TikTok videos using a query.",
  category: 'tools',
  filename: __filename
}, async (conn, mek, m, { from, args }) => {
  
  const query = args.join(" ");

  if (!query) {
    return conn.sendMessage(from, { text: "🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktoksearch Dr Kamran" });
  }

  try {
    // 1. Mengirim info awal tanpa quoted agar tidak rawan crash
    await conn.sendMessage(from, { text: `🔎 Searching TikTok for: *${query}*...` });
    
    // 2. Request ke API
    const apiUrl = `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    const res = response.data;

    if (!res || res.status !== 200 || !res.data || res.data.length === 0) {
      return conn.sendMessage(from, { text: "❌ No results found for your query." });
    }

    // Ambil hasil pertama
    const video = res.data[0];

    const message = `🌸 *TikTok Video Result*:\n\n`
      + `*• Title*: ${video.title || 'No Title'}\n`
      + `*• Author*: ${video.author || 'Unknown'}\n`
      + `*• Duration*: ${video.duration ? video.duration + 's' : 'Unknown'}\n`
      + `*• URL*: ${video.url || 'No Link'}\n\n`
      + `_Sending video file..._`;

    // 3. Cek ketersediaan URL video tanpa watermark
    const videoUrl = video.nowm || video.wm;

    if (videoUrl) {
      // Kirim video secara murni tanpa sangkutan object `quoted: mek` atau `quoted: m`
      await conn.sendMessage(from, {
        video: { url: videoUrl },
        caption: message
      });
    } else {
      await conn.sendMessage(from, { text: `❌ Link video tidak ditemukan.` });
    }

  } catch (error) {
    console.log("============== TERMINAL ERROR LOG ==============");
    console.error(error);
    console.log("================================================");
    
    await conn.sendMessage(from, { text: "❌ Gagal mengirim video. Silahkan coba lagi." });
  }
});
