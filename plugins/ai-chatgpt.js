const fetch = require("node-fetch");
const { cmd } = require("../command");

cmd({
  pattern: "tiktoksearch",
  alias: ["tiktoks", "tiks"],
  desc: "Search for TikTok videos using a query.",
  category: 'tools',
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  if (!args[0]) {
    return reply("🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktoksearch <query>");
  }

  const query = args.join(" ");

  try {
    // Memberikan info awal ke user
    await reply(`🔎 Searching TikTok for: *${query}*...`);
    
    // Fetch data dari API
    const response = await fetch(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`);
    const data = await response.json();

    // Validasi response berdasarkan gambar JSON (status 200 dan data berupa array)
    if (!data || data.status !== 200 || !data.data || data.data.length === 0) {
      return reply("❌ No results found for your query. Please try with a different keyword.");
    }

    // Ambil maksimal 3 hasil agar tidak spam/berat saat mengirim video
    const results = data.data.slice(0, 3);

    for (const video of results) {
      const message = `🌸 *TikTok Video Result*:\n\n`
        + `*• Title*: ${video.title || 'No Title'}\n`
        + `*• Author*: ${video.author || 'Unknown'}\n`
        + `*• Duration*: ${video.duration ? video.duration + 's' : "Unknown"}\n`
        + `*• URL*: ${video.url || 'No Link'}\n\n`;

      // Menggunakan 'video.nowm' sesuai struktur file JSON pada gambar ke-2
      if (video.nowm) {
        await conn.sendMessage(from, {
          video: { url: video.nowm },
          caption: message
        }, { quoted: mek });
      } else {
        await reply(`❌ Failed to retrieve video file for *"${video.title}"*.`);
      }
    }

  } catch (error) {
    console.error("Error in TikTokSearch command:", error);
    reply("❌ An error occurred while searching TikTok. Please try again later.");
  }
});
