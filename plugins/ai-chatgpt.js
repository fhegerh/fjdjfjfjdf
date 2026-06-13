const { cmd } = require('../command');
const axios = require('axios');

const API = "https://api.rifkyshre.biz.id";
const ROUTE = "/scrape/snapvideo";

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
        Error: body?.error || body?.message || "Unknown API error",
      };
    }

    return {
      Status: true,
      Result: body.data,
    };
  } catch (e) {
    return {
      Status: false,
      Error: e.message ?? String(e),
    };
  }
}

cmd({
    pattern: "download",
    alias: ["dl", "snapdl", "insta", "tw", "fb", "tiktok"],
    category: "downloader",
    description: "Download videos from TikTok, Instagram, Facebook, etc.",
    use: '.download <video_url>',
}, async (conn, mek, m, { q, reply }) => {
    
    if (!q) return reply("❌ Please link dein! TikTok, Facebook, Instagram links supported hain.");

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

        const mediaData = data.Result;
        let videoUrl = null;

        // --- NEW DEEP SEARCH KEY PARSING ---
        // 1. Direct structures
        if (typeof mediaData === 'string' && mediaData.startsWith('http')) {
            videoUrl = mediaData;
        } else if (mediaData) {
            videoUrl = mediaData.url || mediaData.videoUrl || mediaData.play || mediaData.download || mediaData.hd || mediaData.sd;
            
            // 2. Agar array 'medias' ke andar data hai
            if (!videoUrl && Array.isArray(mediaData.medias)) {
                videoUrl = mediaData.medias.find(m => m.type?.includes('video') || m.extension === 'mp4' || m.url)?.url || mediaData.medias[0]?.url;
            }
            
            // 3. Agar array 'links' ke andar data hai
            if (!videoUrl && Array.isArray(mediaData.links)) {
                videoUrl = mediaData.links.find(l => l.type === 'video' || l.url?.includes('mp4'))?.url || mediaData.links[0]?.url;
            }

            // 4. Agar array 'urls' ya 'download_list' automatic nesting mein ho
            if (!videoUrl && Array.isArray(mediaData)) {
                videoUrl = mediaData[0]?.url || mediaData[0];
            }
        }

        // Final Verification
        if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.startsWith('http')) {
            // Agar bilkul na mile toh debug ke liye poora object text me dikha dega takki pata chale key kya hai
            console.log("API Response Debug:", JSON.stringify(mediaData));
            throw new Error("Video link key mismatch in API response.");
        }

        let title = mediaData.title || mediaData.caption || mediaData.desc || "Kamran MD Video Downloader";

        // Video Send karein
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
