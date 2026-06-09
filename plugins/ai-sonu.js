const { cmd } = require("../command");

const sonu = async ({ name, mood, genre, lyrics }) => {
  const params = new URLSearchParams({
    apikey: 'Apikey Mu', // Yahan apni API key daaliye agar zaroorat ho
    name,
    mood,
    genre,
    lyrics
  })

  const res = await fetch(`https://fgsi.dpdns.org/api/ai/music/sonu?${params}`)
  const json = await res.json()

  if (!json.status) throw new Error(json.message)

  while (true) {
    const poll = await fetch(json.data.pollUrl)
    const result = await poll.json()

    if (!result.status) throw new Error(result.message)

    if (result.data.status === 'Success') {
      return result.data.result
    }

    await new Promise(resolve => setTimeout(resolve, 5000))
  }
}

const help = command => `*Format :*
.${command} name,mood,genre,lyrics

*Genre Yang Tersedia :*
- pop
- rock
- hiphop
- jazz
- edm
- lofi
- rnb
- metal
- folk

*Mood Yang Tersedia :*
- happy
- sad
- angry
- chill
- romantic
- dark
- energetic

*Contoh :*
.${command} Onegai,happy,pop,[Verse]
The classroom door closes behind me`

cmd({
    pattern: "sonu",
    desc: "Create AI music using Sonu.",
    category: "ai",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    // 1. Check if input is provided (text ki jagah 'q' use hota hai cmd me)
    if (!q) return reply(help("sonu"))

    const match = q.match(/^([^,:]+)[,:]([^,:]+)[,:]([^,:]+)[,:]([\s\S]+)$/)

    if (!match) return reply(help("sonu"))

    const [, name, mood, genre, lyrics] = match

    if (!name.trim()) throw new Error('Name tidak boleh kosong')
    if (!mood.trim()) throw new Error('Mood tidak boleh kosong')
    if (!genre.trim()) throw new Error('Genre tidak boleh kosong')
    if (!lyrics.trim()) throw new Error('Lyrics tidak boleh kosong')

    // Waiting message
    await reply("⏳ Generating your AI music... Please wait.");

    // 2. Call Sonu Music AI function
    const result = await sonu({
      name: name.trim(),
      mood: mood.trim().toLowerCase(),
      genre: genre.trim().toLowerCase(),
      lyrics: lyrics.trim()
    })

    // 3. Send Thumbnail Image with Details
    await conn.sendMessage(
      from,
      {
        image: { url: result.thumbnail },
        caption: [
          `*${result.name}*`,
          '',
          `*Mood :* ${result.mood}`,
          `*Genre :* ${result.genre}`,
          '',
          result.lyrics
        ].join('\n')
      },
      { quoted: mek }
    )

    // 4. Send Audio File
    await conn.sendMessage(
      from,
      {
        audio: { url: result.url },
        mimetype: 'audio/mpeg',
        fileName: `${result.name}.mp3`,
        ptt: false
      },
      { quoted: mek }
    )
  } catch (e) {
    reply(e.message)
  }
});
