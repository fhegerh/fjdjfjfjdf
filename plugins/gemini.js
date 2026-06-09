const { cmd } = require("../command");

// Initialize global session object if it doesn't exist
global.gemsesi = global.gemsesi || {};

// Function to upload image buffer to Uguu.se
async function Uguu(buffer, filename) {
  const form = new FormData()
  const blob = new Blob([buffer])
  form.append('files[]', blob, filename)
  const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form })
  const json = await res.json()
  if (!json.files?.[0]) {
    throw new Error('Upload gagal')
  }
  return json.files[0].url
}

cmd({
    pattern: "gemini",
    desc: "Chat with Gemini AI, supports image analysis and conversation memory.",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    // 1. Check if user prompt is provided (text ki jagah 'q' use hota hai)
    if (!q) return reply(`*Example :* .gemini Jelaskan gambar ini`)

    // Loading notification
    await reply("⏳ Thinking... Please wait.");

    let img = ''
    const target = m.quoted ? m.quoted : m
    const mime = (target.msg || target).mimetype || ''

    // 2. If an image is sent or quoted, upload it first
    if (mime.startsWith('image/')) {
      const buffer = await target.download()
      img = await Uguu(buffer, `image.${mime.split('/')[1]}`)
    }

    // Identify sender session
    const sender = m.sender || m.key.participant || from;
    const sesi = global.gemsesi[sender]

    // 3. Clear session if older than 10 minutes (600,000 ms)
    if (sesi && Date.now() - sesi.time > 600000) {
      delete global.gemsesi[sender]
    }

    // 4. Request Gemini AI API
    const conversationId = global.gemsesi[sender]?.id || ''
    const res = await fetch(
      `https://fgsi.dpdns.org/api/ai/gemini?apikey=APIKEY_MU&text=${encodeURIComponent(q)}&url=${encodeURIComponent(img)}&conversationId=${conversationId}&language=&modeSearch=`
    )
    const json = await res.json()

    if (!json.status) throw new Error(json.message || "Gagal mendapatkan respon")

    // 5. Update session for chat continuity
    global.gemsesi[sender] = {
      id: json.data.result.conversation_id,
      time: Date.now()
    }

    // 6. Send AI answer back
    await reply(json.data.result.answer)

  } catch (e) {
    reply("❌ Error: " + e.message)
  }
});
