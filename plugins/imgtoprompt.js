/**
 * PROJECT     : Uguu Uploader
 * AUTHOR      : BINTANG
 * DESC        : Upload file ke uguu.se - Simple & Cepat
 * USAGE       : node upp.js zaam_avatar.jpeg
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const ENDPOINT = "https://uguu.se/upload.php";
const USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

async function unggah(lokasiBerkas) {
  const jalurLengkap = path.resolve(lokasiBerkas);

  if (!fs.existsSync(jalurLengkap)) {
    return {
      status: "gagal",
      author: "BINTANG",
      code: 404,
      input: lokasiBerkas,
      url: null,
      pesan: "Berkas gak ditemukan"
    };
  }

  const form = new FormData();

  form.append("files[]", fs.createReadStream(jalurLengkap), {
    filename: path.basename(jalurLengkap),
    contentType: "application/octet-stream"
  });

  const respon = await axios.post(ENDPOINT, form, {
    timeout: 120000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
    headers: {
      ...form.getHeaders(),
      accept: "*/*",
      origin: "https://uguu.se",
      referer: "https://uguu.se/",
      "user-agent": USER_AGENT,
      "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const urlFinal = respon.data?.files?.[0]?.url || null;
  const berhasil = respon.status === 200 && respon.data?.success === true && !!urlFinal;

  return {
    status: berhasil ? "sukses" : "gagal",
    author: "BINTANG",
    code: respon.status,
    input: lokasiBerkas,
    url: urlFinal,
    pesan: berhasil ? "Upload berhasil" : "Upload gagal"
  };
}

async function main() {
  const args = process.argv.slice(2);
  const targetFile = args[0];

  if (!targetFile) {
    console.log(JSON.stringify({
      status: "gagal",
      author: "BINTANG",
      code: 400,
      input: null,
      url: null,
      pesan: "Cara pake: node upp.js namafile.png"
    }, null, 2));
    process.exit(0);
  }

  const hasil = await unggah(targetFile);
  console.log(JSON.stringify(hasil, null, 2));
}

main();
