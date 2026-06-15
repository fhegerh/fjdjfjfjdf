//---------------------------------------------------------------------------
//           KAMRAN MD - YOUTUBE VIDEO DOWNLOADER (AUTO-DL)
//---------------------------------------------------------------------------
//  🚀 SEARCH AND DOWNLOAD VIDEOS AUTOMATICALLY
//---------------------------------------------------------------------------

const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

const API_CONFIG = {
    VIDEO_API: Buffer.from("aHR0cHM6Ly9qYXdhZC10ZWNoLnZlcmNlbC5hcHAvZG93bmxvYWQveXRkbD91cmw9", "base64").toString(),
    AUDIO_API: Buffer.from("aHR0cHM6Ly95dC1kbC5vZmZpY2lhbGhlY3Rvcm1hbnVlbC53b3JrZXJzLmRldi8/dXJsPQ==", "base64").toString()
};

/**
 * Normalizes YouTube URLs to a standard format
 */
function normalizeYouTubeUrl(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]{11})/);
  return match ? `https://youtube.com/watch?v=${match[1]}` : null;
}

/**
 * Core Data Fetching Logic using Jawad-Tech API
 */
async function fetchDownloadData(url, retries = 2) {
  try {
    const apiUrl = `${API_CONFIG.VIDEO_API}${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl, { timeout: 20000 });
    const data = response.data;

    if (data.status === true && data.result) {
      return {
        video_url: data.result.mp4,
        title: data.result.title || "YouTube Video",
      };
    }
    throw new Error("API failed to return download link.");
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return fetchDownloadData(url, retries - 1);
    }
    return null;
  }
}

// --- MAIN COMMAND: VIDEO ---

cmd(
  {
    pattern: "video2",
    alias: ["ytmp4", "vdl2"],
    react: "🎥",
    desc: "Search and download high-quality videos from YouTube.",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply, prefix, command }) => {
    try {
      if (!q) return reply(`🎥 *Video Downloader*\n\nUsage: \`${prefix + command} <name or link>\`\nExample: \`${prefix + command} perfect ed sheeran\``);

      await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

      // Step 1: Search for the video
      const url = normalizeYouTubeUrl(q);
      let ytdata;

      if (url) {
        const searchResults = await yts({ videoId: q.split('v=')[1]?.split('&')[0] || q.split('/').pop() });
        ytdata = searchResults;
      } else {
        const searchResults = await yts(q);
        if (!searchResults.videos.length) return reply("❌ No videos found for your query!");
        ytdata = searchResults.videos[0];
      }

      // Step 2: Send info message
      const infoText = `
🎥 *YT VIDEO DOWNLOADER* 🎥

📌 *Title:* ${ytdata.title}
🎬 *Channel:* ${ytdata.author?.name || 'Unknown'}
⏱️ *Duration:* ${ytdata.timestamp}
👁️ *Views:* ${ytdata.views.toLocaleString()}

_📥 Processing your video file, please wait..._

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ KAMRAN-MD`;

      await conn.sendMessage(from, { image: { url: ytdata.thumbnail || ytdata.image }, caption: infoText }, { quoted: mek });
      await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

      // Step 3: Fetch download link from API
      const dlData = await fetchDownloadData(ytdata.url);

      if (!dlData || !dlData.video_url) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        return reply("❌ Download link could not be generated. Please try again later.");
      }

      // Step 4: Send the Video file (without externalAdReply)
      await conn.sendMessage(
        from,
        {
          video: { url: dlData.video_url },
          mimetype: "video/mp4",
          caption: `✅ *${dlData.title}*\n\n*🚀 Powered by KAMRAN-MD*`
        },
        { quoted: mek }
      );

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
      console.error("Video DL Error:", e);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      reply(`⚠️ *Error:* ${e.message || "Something went wrong."}`);
    }
  }
);

// --- SONG COMMAND ---

cmd({
    pattern: "song",
    alias: ["play", "ytmp3"],
    desc: "Download songs via name or link.",
    category: "download",
    react: "🎧",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name or YouTube link!");

        // Search Reaction
        await conn.sendMessage(from, { react: { text: "🔎", key: mek.key } });

        let videoUrl = q;
        let vid;

        // Check agar input link hai ya name
        const isUrl = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g);

        if (isUrl) {
            // Agar link hai to details fetch karo
            const search = await yts({ videoId: q.split('v=')[1] || q.split('/').pop() });
            vid = search;
            videoUrl = q;
        } else {
            // Agar naam hai to search karo
            const search = await yts(q);
            if (!search || !search.videos.length) return reply("❌ No results found.");
            vid = search.videos[0];
            videoUrl = vid.url;
        }

        // Preview Message
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail || vid.image },
            caption: `╭━━〔 🎵 𝗠𝗨𝗦𝗜𝗖 𝗙𝗢𝗨𝗡𝗗 〕━━━╮\n┃ 🎧 *Title* : ${vid.title}\n┃ ⏱️ *Duration* : ${vid.timestamp || 'N/A'}\n╰━━━━━━━━━━━━━━━━━╯\n\n⏳ *Downloading audio...*`
        }, { quoted: mek });

        // API Download (Using encoded API)
        let api = `${API_CONFIG.AUDIO_API}${encodeURIComponent(videoUrl)}`;
        let { data } = await axios.get(api);

        if (!data || !data.status || !data.audio) {
            return reply("❌ API error! Try again later.");
        }

        // Sending Audio only
        await conn.sendMessage(from, {
            audio: { url: data.audio },
            mimetype: "audio/mpeg"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});
