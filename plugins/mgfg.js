const { cmd } = require('../command');
const axios = require('axios');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const FormData = require('form-data');

// --- CONSTANTS ---
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`;

const APP_ID = "aifaceswap";
const U_ID = "1H5tRtzsBkqXcaJ";

// --- CRYPTO HELPERS ---
function generateRandomString(len) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
}

function aesenc(data, key) {
    const k = CryptoJS.enc.Utf8.parse(key);
    return CryptoJS.AES.encrypt(data, k, { iv: k, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
}

function rsaenc(data) {
    const buffer = Buffer.from(data, 'utf8');
    return crypto.publicEncrypt({ key: PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }, buffer).toString('base64');
}

function gencryptoheaders(type, fp = null) {
    const e = new Date();
    const n = Math.floor(new Date(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), e.getUTCHours(), e.getUTCMinutes(), e.getUTCSeconds()).getTime() / 1000);
    const r = crypto.randomUUID();
    const i = generateRandomString(16);
    const fingerPrint = fp || crypto.randomBytes(16).toString('hex');
    const s = rsaenc(i);
    let signStr = (type === 'upload') ? `${APP_ID}:${r}:${s}` : `${APP_ID}:${U_ID}:${n}:${r}:${s}`;
    return {
        'fp': fingerPrint,
        'fp1': aesenc(`${APP_ID}:${fingerPrint}`, i),
        'x-guide': s,
        'x-sign': aesenc(signStr, i),
        'x-code': Date.now().toString()
    };
}

// --- COMMAND ---
cmd({
    pattern: "faceswap",
    alias: ["aiface"],
    category: "ai",
    description: "FaceSwap your image using AI",
    use: '.faceswap <reply image> <prompt>',
}, async (conn, mek, m, { q, reply, quoted }) => {
    
    // Check if image exists
    const mime = (quoted || mek).mimetype || "";
    if (!/image/.test(mime)) return reply("❌ Please reply to an image!");
    if (!q) return reply("❌ Please provide a prompt. Example: .faceswap change clothes to batik");

    await reply("⏳ Uploading and processing AI task...");

    try {
        // Download image
        const imgBuffer = await conn.downloadAndSaveMediaMessage(quoted || mek);
        
        // 1. Upload
        const cryptoHeaders = gencryptoheaders('upload');
        const form = new FormData();
        form.append('file', require('fs').createReadStream(imgBuffer), { filename: 'input.jpg' });
        form.append('fn_name', 'demo-image-editor');
        form.append('request_from', '9');
        form.append('origin_from', '8f3f0c7387123ae0');

        const uploadRes = await axios.post('https://app-v1.live3d.io/aitools/upload-img', form, {
            headers: { ...form.getHeaders(), ...cryptoHeaders }
        });
        const { path, fp } = { path: uploadRes.data.path, fp: cryptoHeaders.fp };

        // 2. Create Job
        const createHeaders = gencryptoheaders('create', fp);
        const taskRes = await axios.post('https://app-v1.live3d.io/aitools/of/create', {
            fn_name: 'demo-image-editor',
            call_type: 3,
            input: { model: 'nano_banana', source_images: [path], prompt: q, aspect_radio: 'auto', request_from: 9 },
            request_from: 9,
            origin_from: '8f3f0c7387123ae0'
        }, { headers: createHeaders });

        const taskId = taskRes.data.task_id;
        await reply("✅ Task created! Polling status...");

        // 3. Polling
        let result;
        for (let i = 0; i < 15; i++) {
            await new Promise(r => setTimeout(r, 5000));
            const checkHeaders = gencryptoheaders('check', fp);
            const statusRes = await axios.post('https://app-v1.live3d.io/aitools/of/check-status', {
                task_id: taskId, fn_name: 'demo-image-editor', call_type: 3, request_from: 9, origin_from: '8f3f0c7387123ae0'
            }, { headers: checkHeaders });
            
            result = statusRes.data;
            if (result.status === 2) break;
            if (result.status === 3) return reply("❌ AI Task failed.");
        }

        if (result.status !== 2) return reply("❌ Polling timeout.");

        // Send Result
        await conn.sendMessage(m.chat, { 
            image: { url: 'https://temp.live3d.io/' + result.result_image },
            caption: `✨ *AI FACE SWAP SUCCESS*\n\nPrompt: ${q}` 
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("❌ Error: " + e.message);
    }
});
