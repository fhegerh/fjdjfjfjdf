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
    // 1. Kirim status pencarian
    await conn.sendMessage(from, { text: `🔎 Searching TikTok for: *${query}*...` });
    
    // 2. Ambil data dari API
    const apiUrl = `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    const res = response.data;

    if (!res || res.status !== 200 || !res.data || res.data.length === 0) {
      return conn.sendMessage(from, { text: "❌ No results found for your query." });
    }

    const video = res.data[0];
    const videoUrl = video.nowm || video.wm;

    if (!videoUrl) {
      return conn.sendMessage(from, { text: `❌ Link video tidak ditemukan.` });
    }

    // 3. Beri tahu user kalau bot sedang mendownload file medianya
    await conn.sendMessage(from, { text: `📥 Downloading media buffer dari server...` });

    // 4. STRATEGI UTAMA: Download video menjadi Buffer agar Baileys tidak gagal kirim
    const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer' })
      .then(res => Buffer.from(res.data, 'binary'));

    // Susun caption teks informasi video
    const message = `🌸 *TikTok Video Result*:\n\n`
      + `*• Title*: ${video.title || 'No Title'}\n`
      + `*• Author*: ${video.author || 'Unknown'}\n`
      + `*• Duration*: ${video.duration ? video.duration + 's' : 'Unknown'}\n`
      + `*• URL*: ${video.url || 'No Link'}\n\n`
      + `_Powered by Kamran MD_`;

    // 5. Kirim data Buffer video ke WhatsApp
    await conn.sendMessage(from, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: message
    });

  } catch (error) {
    console.log("============== TERMINAL ERROR LOG ==============");
    console.error(error);
    console.log("================================================");
    
    await conn.sendMessage(from, { text: "❌ Sistem gagal memproses video buffer. Silahkan coba kata kunci lain!" });
  }
});
