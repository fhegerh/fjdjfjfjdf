const { cmd } = require('../command');
const axios = require('axios');

const API = "https://api.rifkyshre.biz.id";
const ROUTE = "/scrape/snapvideo";

// Scraper Function
async function snapvideo(url) {
  try {
    const res = await axios.post(
      `${API}${ROUTE}`,
      { url },
      {
        timeout: 45000,
        validateStatus: () => true,
        headers: { "Content-Type": "application/json" },
      },
    );

    const body = res.data;
    if (!body?.status) {
      return {
        Status: false,
        Error: body?.error ?? "Unknown error",
      };
    }

    return {
      Status: true,
      Result: body.data, // Ismein media urls, title wagerah hoga
    };
  } catch (e) {
    return {
      Status: false,
      Error: e.message ?? String(e),
    };
  }
}

// Bot Command
cmd({
    pattern: "download",
    alias: ["dl", "snapdl", "insta", "tw", "fb"],
    category: "downloader",
    description: "Download videos from TikTok, Instagram, Twitter, FB, etc.",
    use: '.download <video_url>',
}, async (conn, mek, m, { q, reply }) => {
    
    if (!q) return reply("❌ Please provide a valid video link!\n\n*Supported platforms:* TikTok, Instagram, Twitter/X, Facebook, Threads, etc.");

    // Simple URL validation
    if (!q.startsWith("http://") && !q.startsWith("https://")) {
        return reply("❌ Invalid URL format.");
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: mek.key } });

    try {
        const data = await snapvideo(q);

        if (!data.Status) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Error: ${data.Error}`);
        }

        // Response handling
        const mediaData = data.Result;
        
        // Snapvideo tools aam taur par resources array ya direct media url deta hai.
        // Agar response mein 'medias' ya 'links' array ho toh sabse best quality (video) nikalte hain:
        let videoUrl = mediaData.url || (mediaData.medias && mediaData.medias[0]?.url);
        let title = mediaData.title || mediaData.message || "Universal Downloader";

        if (!videoUrl) {
            // Agar formats array hai toh usme check karein
            const videoLink = mediaData.links?.find(l => l.type === 'video' || l.extension === 'mp4');
            videoUrl = videoLink ? videoLink.url : null;
        }

        if (!videoUrl) throw new Error("Could not extract a downloadable video URL.");

        // Video Send Karein
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `🎬 *Title:* ${title}\n\n> © KAMRAN-MINI-BOT ッ`,
            mimetype: "video/mp4"
        }, { quoted: mek });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: mek.key } });
        reply("❌ System Error: " + e.message);
    }
});
