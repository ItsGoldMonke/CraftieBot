require("dotenv").config();

const { App } = require("@slack/bolt");
const mcstatus = require('node-mcstatus');

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


  await respond(

    {text:
      `Server Status of ${response.host}:${response.port}:
      ${(response.online) ? 
      " 🟢 Server Online" : " 🔴 Server Offline"}
      Minecraft version: ${(edition == 'java') ? response.version.name_raw : response.version.name}
      MOTD: ${response.motd.clean.trim().replace(/\n/g, ' ')}
      Players: ${response.players.online}/${response.players.max}
      Online Players: ${response.players.list && response.players.list.length > 0 ? response.players.list.map(player => player.name_clean).join(', ') : 'None/Unknown'}`
    });


  } catch(err) {
    console.log(err)
    await respond({ text: "Failed to fetch"});
  }

  });
  


(async () => {
  await app.start();
  console.log("bot is running!");
})();

