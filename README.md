# Craftie - A Slack bot for getting minecraft info

This is a bot I made for the Hack Club Slack that fetches specific minecraft-related info using slack commands.

The commands currently avaiable are:

        /craftie-help - Show help message
        /craftie-ping - Check bot latency
        /craftie-status (java|bedrock) <server> [port] - Check Minecraft server status
        /craftie-player <name|uuid> - Get player info with a nice image

`/craftie-status` fetches information on minecraft servers, both bedrock and java, such as their MOTD, how many players are online, what minecraft version it uses and more as seen below:

![Output of `/craftie-status` command](images/serverstatus.png)

`/craftie-player` fetches information on a minecraft player account using their username or UUID. It currently only shows the UUID, username, and skin images, however more is to be added (if possible).

![Output of `/craftie-player` command](images/playercmd.png)

`/craftie-ping` is a simple command that sends the ping from the bot to slack.

`/craftie-help` is a command that shows all commands and what they do.

# How to use the bot (as a hack club member)

In order to use the bot you need to use it in a channel the bot is in so it can send images. These channels currently are `#monke-coding` (my personal channel) and `#bot-spam`, however you can add it to more with `/invite @Craftie`, however make sure it's allowed in the channel you're using it.

Excecuting the commands themselves is pretty easy, as you can just start typing `/craftie-` and all commands will be at top. If you want to know what all commands are you can do `/craftie-help`