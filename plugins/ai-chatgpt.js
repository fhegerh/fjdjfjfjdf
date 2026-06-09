const { cmd } = require("../command");
const axios = require("axios"); // Axios library ka hona zaroori hai

cmd({
    pattern: "xvideos", // Is command ko run karne ke liye `.xvideos` likhna hoga (e.g., .xvideos link)
    desc: "Download videos from XVideos.",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
    try {
        // Agar user ne video link nahi di
        if (!q) {
            return await reply("❌ Please provide a valid XVideos link!\n*Example:* .xvideos https://www.xvideos.com/video12345");
        }

        // Check agar link XVideos ki hi hai
        if (!q.includes("xvideos.com")) {
            return await reply("❌ Yeh valid XVideos link nahi hai.");
        }

        // User ko waiting message dikhane ke liye
        await reply("📥 Fetching video, please wait...");

        // API URL
        const url = `https://api.princetechn.com/api/download/xvideosdl?apikey=prince&url=${encodeURIComponent(q)}`;
        
        const response = await axios.get(url);
        
        // Agar API se data successfully mil jata hai
        if (response.data && response.data.result) {
            const data = response.data.result;
            
            // API response structure ke mutabiq video url aur title nikalna
            const videoUrl = typeof data === 'object' ? (data.url || data.link || data.download) : data;
            const title = data.title || "XVideos Download";

            if (videoUrl) {
                // Direct video file chat me send karne ke liye
                await conn.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: `🎬 *Title:* ${title}\n\n⚡ *Downloaded Successfully!*` 
                }, { quoted: m });
            } else {
                return await reply("❌ Video download link nahi mil saki.");
            }
        } else {
            return await reply("❌ API se koi response nahi mila ya link expired hai.");
        }

    } catch (e) {
        console.log(e);
        return await reply(`❌ Error occurred: ${e.message}`);
    }
});
