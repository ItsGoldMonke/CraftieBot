require("dotenv").config();

const { App } = require("@slack/bolt");
const mcstatus = require('node-mcstatus');
const axios = require('axios');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

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
        /craftie-status - Check Minecraft server status
        /craftie-player - Get player info`
    });
})

app.command("/craftie-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/craftie-player", async ({ command, ack, respond, client }) => {
  await ack();
  try {

    // Send inital message to indicate that the bot is processing the request and in order to create a thread.
    const message = await client.chat.postMessage({
      channel: command.channel_id,
      thread_ts: command.ts,
      text: "Generating status..."
    });



    const args = command.text.trim().split(/\s+/);
    const uuidOrUsername = args[0]; // The UUID or username of the player.
    const uuid = (await axios.get(`https://playerdb.co/api/player/minecraft/${uuidOrUsername}`)).data.data.player.id;    console.log(uuid);
    const username = (await axios.get(`https://playerdb.co/api/player/minecraft/${uuidOrUsername}`)).data.data.player.username;    console.log(username);
    if (!uuidOrUsername) {
      return respond({text: "Usage: /craftie-player <UUID/Username>"})
    }
    GlobalFonts.registerFromPath("./MinecraftDefault-Regular.ttf", "Minecraft");
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3e3e3e';
    ctx.fillRect(0, 0, 800, 400);
    ctx.strokeStyle = '#00000065';
    ctx.strokeRect(0, 0, 800, 400);
    ctx.drawImage(await loadImage(`https://api.mcheads.org/head/${uuidOrUsername}/200`), 560, 100, 200, 200);
    ctx.font = '32px Minecraft';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Player Info for ${username}:`, 20, 40);
    ctx.fillText(`UUID: ${uuid}`, 20, 80);
    ctx.drawImage(await loadImage(`https://api.mcheads.org/player/${uuidOrUsername}/150`), 20, 100, 150, 300);



    const buffer = canvas.toBuffer('image/png');
    const result = await client.filesUploadV2({
      channel_id: command.channel_id,
      thread_ts: message.ts,
      file: buffer,
      filename: "status.png"
    });

    await client.chat.update({
      channel: command.channel_id,
      ts: message.ts,
      text: "Status generated successfully! Find in thread.",
    });





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