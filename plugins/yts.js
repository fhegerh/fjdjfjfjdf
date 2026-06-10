const { cmd } = require('../command');
const yts = require("yt-search");
const axios = require('axios');

// Global cache memory YouTube links ko chat ID ke mutabiq yaad rakhne ke liye
if (!global.ytCache) global.ytCache = {};

// ==========================================
// 1. YOUTUBE SEARCH COMMAND (.yt / .yts)
// ==========================================
cmd({
    pattern: "yt",
    alias: ["yts", "youtube", "ytsearch"],
    desc: "Search for YouTube videos and get a numbered list.",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a search query!\n\n*Example:* .yt dynamic gaming");

        await reply(`⏳ Searching YouTube for "${q}"...`);

        // Search API Request
        const searchUrl = `https://api.princetechn.com/api/search/yts?apikey=prince&query=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl);
        
        let data = response.data;
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { return reply("❌ Invalid API response format."); }
        }

        let results = data.results || data.result || data.data || [];
        if (!Array.isArray(results) && data.result && Array.isArray(data.result)) {
            results = data.result;
        }

        if (!results || results.length === 0) {
            return reply("❌ No results found for your search query.");
        }

        // Resetting and saving search results in global cache for this chat
        global.ytCache[from] = [];

        let responseText = `🎥 *YOUTUBE SEARCH RESULTS* 🎥\n\n`;
        responseText += `🔍 *Query:* _${q}_\n\n`;

        // Listing maximum 10 results
        const maxResults = Math.min(results.length, 10);
        
        for (let i = 0; i < maxResults; i++) {
            let video = results[i];
            let title = video.title || "No Title";
            let duration = video.duration || video.timestamp || "Unknown";
            let videoLink = video.url || video.link || (video.videoId ? `https://www.youtube.com/watch?v=${video.videoId}` : null);

            if (videoLink) {
                global.ytCache[from].push(videoLink); // Saving link to temporary cache
                
                responseText += `*${i + 1}.* ${title}\n`;
                responseText += `⏱️ *Duration:* ${duration}\n`;
                responseText += `───────────────────\n`;
            }
        }

        responseText += `\n📥 *How to Download:*\n`;
        responseText += `🎵 *For MP3 (Audio):* Reply with \`.yta 1\`\n`;
        responseText += `🎥 *For MP4 (Video):* Reply with \`.ytv 1\``;

        return await conn.sendMessage(from, { text: responseText }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ Search error: ${error.message}`);
    }
});


// ==========================================
// 2. YOUTUBE AUDIO DOWNLOADER (.yta / .ytmp3)
// ==========================================
cmd({
    pattern: "yta",
    alias: ["ytmp3", "audio"],
    desc: "Download YouTube audio via list number or link.",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a YouTube link or list number!\n\n*Examples:*\n🔹 `.yta 1` (From list)\n🔹 `.yta https://youtube.com/...` (Direct link)");

        let videoUrl = q;
        const isNumber = !isNaN(q) && parseInt(q) > 0 && parseInt(q) <= 10;

        if (isNumber) {
            const index = parseInt(q) - 1;
            if (!global.ytCache[from] || !global.ytCache[from][index]) {
                return reply("❌ Session expired or invalid number. Please search again first using `.yt [query]`");
            }
            videoUrl = global.ytCache[from][index];
        }

        await reply("⏳ Fetching your audio file, please wait...");

        // Audio API Request
        const downloadApi = `https://api.princetechn.com/api/download/yta?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(downloadApi);
        
        let data = response.data;
        if (typeof data === 'string') data = JSON.parse(data);

        const resObj = data.result || data.data || data;
        const downloadUrl = resObj.downloadUrl || resObj.dl_url || resObj.link || resObj.url || (resObj.files?.high || resObj.files?.low);

        if (!downloadUrl) return reply("❌ Audio stream link not found in the API response.");

        // Sending Audio/MP3 file directly to chat
        return await conn.sendMessage(from, { 
            audio: { url: downloadUrl }, 
            mimetype: 'audio/mp4', 
            ptt: false 
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ Audio download error: ${error.message}`);
    }
});


// ==========================================
// 3. YOUTUBE VIDEO DOWNLOADER (.ytv / .ytmp4)
// ==========================================
cmd({
    pattern: "ytv",
    alias: ["ytmp4", "video2"],
    desc: "Download YouTube video via list number or link.",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a YouTube link or list number!\n\n*Examples:*\n🔹 `.ytv 1` (From list)\n🔹 `.ytv https://youtube.com/...` (Direct link)");

        let videoUrl = q;
        const isNumber = !isNaN(q) && parseInt(q) > 0 && parseInt(q) <= 10;

        if (isNumber) {
            const index = parseInt(q) - 1;
            if (!global.ytCache[from] || !global.ytCache[from][index]) {
                return reply("❌ Session expired or invalid number. Please search again first using `.yt [query]`");
            }
            videoUrl = global.ytCache[from][index];
        }

        await reply("⏳ Fetching your video file, please wait...");

        // Video API Request
        const downloadApi = `https://api.princetechn.com/api/download/ytv?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(downloadApi);
        
        let data = response.data;
        if (typeof data === 'string') data = JSON.parse(data);

        const resObj = data.result || data.data || data;
        const downloadUrl = resObj.downloadUrl || resObj.dl_url || resObj.link || resObj.url || (resObj.files?.high || resObj.files?.low);
        const title = resObj.title || "YouTube Video";

        if (!downloadUrl) return reply("❌ Video stream link not found in the API response.");

        let captionText = `🎥 *YOUTUBE DOWNLOADER* 🎥\n\n📌 *Title:* ${title}\n\n*Powered by DR KAMRAN*`;

        // Sending Video file directly to chat
        return await conn.sendMessage(from, { 
            video: { url: downloadUrl }, 
            caption: captionText 
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        return reply(`❌ Video download error: ${error.message}`);
    }
});

