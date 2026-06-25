require("dotenv").config();

const { App } = require("@slack/bolt");
const mcstatus = require('node-mcstatus');
const axios = require('axios');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require("fs");


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});
app.command("/craftie-help", async ({ command, ack, respond }) => {
    await ack();
    await respond ({
        text: 
        `
        Available commands:
        /craftie-help - Show this message
        /craftie-ping - Check bot latency
        /craftie-status - Check Minecraft server status`
    });
})

app.command("/craftie-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/craftie-player", async ({ command, ack, respond }) => {
  await ack();
  try {
    const args = command.text.trim().split(/\s+/);
    const option = args[0]; // Argument 'uuid' or 'username' for which MC edition the server is.
    const uuidOrUsername = args[1]; // The UUID or username of the player.
    if (!option || !uuidOrUsername) {
      return respond({text: "Usage: /craftie-player (uuid|name) <UUID/Username>"})
    }
    GlobalFonts.registerFromPath("./MinecraftDefault-Regular.ttf", "Minecraft");
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3e3e3e';
    ctx.fillRect(0, 0, 400, 200);
    ctx.strokeStyle = '#00000065';
    ctx.strokeRect(0, 0, 400, 200);
    ctx.drawImage(await loadImage(`https://api.mcheads.org/head/${uuidOrUsername}/100`), 280, 50, 100, 100);
    ctx.font = '24px Minecraft';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Player Info for ${uuidOrUsername}`, 20, 40);

    const png = await canvas.encode('png');
    fs.writeFileSync('output.png', png);
    await respond(
{
  text: `Player info for ${uuidOrUsername}`,
}
    );
  } catch(err) {
    console.log(err)
    await respond({ text: "Failed to fetch. Please ensure the server is online and the host/port are correct. Otherwise, the server may be experiencing issues." });
  }
});


app.command("/craftie-status", async ({ command, ack, respond }) => {
  await ack();
  try {
  
  const args = command.text.trim().split(/\s+/);

  const edition = args[0]; // Argument 'java' or 'bedrock' for which MC edition the server is.
  const host = args[1]; // The ip adress or domain the mincraft server is hosted on.
  const port = args[2]; // optional argument if the server is hosted on a non-standard port.
  
  if (!edition || !host) {
    return respond({text: "Usage: /craftie-status (java|bedrock) <host> [port]"})
  }
  let response;
  if (edition == 'java') {
    response = await mcstatus.statusJava(host, port)
  } else if (edition == 'bedrock') {
    response = await mcstatus.statusBedrock(host, port)
  } else {
    return respond({text: "Usage: /craftie-status (java|bedrock) <host> [port]"})
  }

  const versionName = edition == 'java'
    ? (response.version?.name_raw ?? 'Unavailable')
    : (response.version?.name ?? 'Unavailable');
  const motd = response.motd?.clean?.trim().replace(/\n/g, ' ') ?? 'Unavailable';
  const playersOnline = response.players?.online ?? 0;
  const playersMax = response.players?.max ?? 'Unavailable';
  let srvPort = response.port;
  const onlinePlayers = response.players?.list && response.players.list.length > 0
    ? response.players.list.map(player => player.name_clean).join(', ')
    : 'None/Unknown';
  if (edition == 'java') {
    srvPort = (await axios.get(`https://api.mcstatus.io/v2/status/java/${host}${(port) ? `:${port}` : ''}`)).data.srv_record.port;

  }
  const imageUrl = (edition == 'java') ? `https://sr-api.sfirew.com/server/${response.host}:${(srvPort) ? srvPort : response.port}/icon.png` : "https://minecraft.wiki/images/Unknown_server.png";
  await respond(
        {
	blocks: [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Server Status of ${response.host}:${(srvPort) ? srvPort : response.port}
${(response.online) ? "🟢 Server Online" : "🔴 Server Offline"}
Minecraft version: ${versionName}
MOTD: \`${motd}\`
Players: ${playersOnline}/${playersMax}
Online Players: ${onlinePlayers}`
			},
			"accessory": {
				"type": "image",
				"image_url": `${imageUrl}`,
				"alt_text": "Server Icon"
			}
		}
	]
})
    

    
      /*text:
      `Server Status of ${response.host}:${response.port}:
      ${(response.online) ? 
      " 🟢 Server Online" : " 🔴 Server Offline"}
      Minecraft version: ${(edition == 'java') ? response.version.name_raw : response.version.name}
      MOTD: ${response.motd.clean.trim().replace(/\n/g, ' ')}
      Players: ${response.players.online}/${response.players.max}
      Online Players: ${response.players.list && response.players.list.length > 0 ? response.players.list.map(player => player.name_clean).join(', ') : 'None/Unknown'}`
    }); */


  } catch(err) {
    console.log(err)
    await respond({ text: "Failed to fetch. Please ensure the server is online and the host/port are correct. Otherwise, the server may be experiencing issues." });
  }

  });
  


(async () => {
  await app.start();
  console.log("bot is running!");
})();