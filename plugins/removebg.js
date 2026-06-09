const { cmd } = require("../command");

cmd({
    pattern: "removebg",
    alias: ["rbg"],
    desc: "Remove background from an image.",
    category: "tools",
    react: "✂️",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    // 1. Check if image is provided (quoted or direct)
    const target = m.quoted ? m.quoted : m
    const mime = (target.msg || target).mimetype || ''
    
    if (!mime.startsWith('image/')) {
        return reply('❌ Mana gambarnya? Please reply to an image or send an image with the command.')
    }

    // Loading status
    await reply("⏳ Removing background... Please wait.");

    // 2. Download the image
    const img = await target.download()
    
    // 3. Prepare Form Data for the API
    const form = new FormData()
    form.append(
      'file',
      new Blob([img], { type: 'image/jpeg' }),
      'image.jpeg'
    )

    // 4. Hit the Background Remover API
    const res = await fetch('https://fgsi.dpdns.org/api/tools/removebg', {
      method: 'POST',
      headers: { apikey: 'fgsiapi-36cd2f79-6d' }, // Yahan apni API Key lagayein
      body: form
    })
    
    const json = await res.json()

    if (!json.status) throw new Error(json.message || "Gagal memproses gambar")

    const url = json.data.bgRemoved

    // 5. Send the result back to the chat
    await conn.sendMessage(from, { image: { url } }, { quoted: mek })

  } catch (e) {
    reply("❌ Error: " + e.message)
  }
});
