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

// Helper function to deep-search any URL from complex JSON response
function findVideoUrl(obj) {
    if (!obj) return null;
    
    // Agar direct string link hai
    if (typeof obj === 'string' && obj.startsWith('http')) {
        if (obj.includes('mp4') || obj.includes('video') || obj.includes('googlevideo') || obj.includes('snapcdn')) {
            return obj;
        }
    }
    
    // Agar object ya array hai toh andar deep search karo
    if (typeof obj === 'object') {
        // Pehle priority keys check karo
        const priorityKeys = ['url', 'videoUrl', 'play', 'download', 'hd', 'sd', 'main', 'link'];
        for (let key of priorityKeys) {
            if (obj[key] && typeof obj[key] === 'string' && obj[key].startsWith('http')) {
                return obj[key];
            }
        }
        
        // Agar priority keys me na mile toh pure object ko loop karo
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const found = findVideoUrl(obj[key]);
                if (found) return found;
            }
        }
    }
    return null;
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

        // Deep scanner se link nikalna
        const videoUrl = findVideoUrl(data.Result);

        if (!videoUrl) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: mek.key } });
            console.log("FULL API RESPONSE:", JSON.stringify(data.Result, null, 2));
            return reply("❌ Error: API se downloadable video link extract nahi kiya ja saka.");
        }

        let title = data.Result?.title || data.Result?.caption || data.Result?.desc || "Kamran MD Video Downloader";

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
