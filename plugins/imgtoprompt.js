const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "imgtoprompt",
    alias: ["toprompt", "image2prompt", "promptgen"],
    desc: "Generate detailed midjourney/stable-diffusion prompt from an image.",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // Checking if the incoming message or quoted message contains an image
        const isQuotedImage = quoted && (quoted.type === 'image' || quoted.mtype === 'imageMessage');
        const isDirectImage = m.type === 'image' || m.mtype === 'imageMessage';

        if (!isDirectImage && !isQuotedImage) {
            return reply("❌ Please reply to an image or send an image with the caption *.imgtoprompt*");
        }

        await reply("📥 Downloading image from WhatsApp servers... Please wait.");

        // Target message containing the media component
        const targetMessage = quoted ? quoted : m;
        
        // Dynamic media downloader block supporting major Baileys structures
        let buffer;
        try {
            if (typeof conn.downloadMediaMessage === 'function') {
                buffer = await conn.downloadMediaMessage(targetMessage);
            } else if (typeof conn.downloadAndSaveMediaMessage === 'function') {
                const pathFile = await conn.downloadAndSaveMediaMessage(targetMessage);
                const fs = require('fs');
                buffer = fs.readFileSync(pathFile);
                fs.unlinkSync(pathFile); // Immediate cleanup to save disk space
            } else {
                // Global baileys library dependency fallback
                const { downloadMediaMessage } = require('@whiskeysockets/baileys');
                buffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: console });
            }
        } catch (downloadError) {
            console.error(downloadError);
            return reply("❌ Failed to download media. Please ensure the image is fully loaded.");
        }

        if (!buffer) return reply("❌ Extraction failed. Media buffer is empty.");

        // Encoding binary buffer straight to Base64 (No local file required)
        const base64Image = buffer.toString('base64');
        const mimeType = (targetMessage.msg || targetMessage).mimetype || 'image/jpeg';

        await reply("⏳ Submitting data payload to Nano Banana Pro AI...");

        const BASE_URL = "https://aiconvert.online/api";
        const USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36";

        // PHASE 1: Submitting the base64 job payload
        const payload = {
            imageData: base64Image,
            mimeType: mimeType,
            language: "en",
            promptType: "nano-banana-pro"
        };

        const submitResponse = await axios.post(`${BASE_URL}/submit-prompt-job`, payload, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
                "Referer": "https://aiconvert.online/prompt-generator"
            },
            timeout: 30000
        });

        let submitData = submitResponse.data;
        if (typeof submitData === 'string') submitData = JSON.parse(submitData);

        if (!submitData || !submitData.taskId) {
            return reply(`❌ AI submission rejected: ${submitData?.message || "Invalid API response structure"}`);
        }

        const taskId = submitData.taskId;
        await reply("🧠 Image received! AI is processing layout details...");

        // PHASE 2: Polling loop to wait for completion status
        let maxRetries = 35;
        let delayMs = 2000;
        let generatedPrompt = null;

        for (let i = 0; i < maxRetries; i++) {
            // Wait for 2 seconds before checking status
            await new Promise(resolve => setTimeout(resolve, delayMs));

            const statusResponse = await axios.get(`${BASE_URL}/check-status-kv`, {
                params: { taskId: taskId },
                headers: {
                    "User-Agent": USER_AGENT,
                    "Referer": "https://aiconvert.online/prompt-generator"
                },
                timeout: 10000
            });

            let statusData = statusResponse.data;
            if (typeof statusData === 'string') statusData = JSON.parse(statusData);

            if (statusData.status === "SUCCESS" && statusData.result) {
                generatedPrompt = statusData.result.generatedPrompt;
                break;
            } else if (statusData.status === "FAILED") {
                return reply(`❌ AI engine threw an error: ${statusData.message || "Unknown pipeline issue."}`);
            }
        }

        if (!generatedPrompt) {
            return reply("❌ Processing timeout. Server did not return prompt updates.");
        }

        // PHASE 3: Printing formatted markdown response
        let txt = `🎨 *IMAGE TO AI PROMPT GENERATOR* 🎨\n\n`;
        txt += `📝 *Generated Prompt:*\n\`\`\`${generatedPrompt}\`\`\`\n\n`;
        txt += `*Powered by DR KAMRAN*`;

        return await reply(txt);

    } catch (error) {
        console.error(error);
        return reply(`❌ ImgToPrompt System Error: ${error.message}`);
    }
});
