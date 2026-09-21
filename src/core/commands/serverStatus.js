const mcstatus = require("node-mcstatus");

async function getServerStatus(edition, host, port) {
    let response = null;
    let versionName = "Unavailable";

    switch (edition) {
        case "java":
            response = await mcstatus.statusJava(host, port);
            break;
        case "bedrock":
            response = await mcstatus.statusBedrock(host, port);
            break;
        default:
            response = null;
            break;
    }

    if (!(response == null)) {
        versionName =
            edition == "java"
                ? (response.version?.name_raw ?? "Unavailable")
                : (response.version?.name ?? "Unavailable");
        console.log("Version name set:", versionName);
    }

    if (response == null) {
        return {
            failed: true,
            failReason: "No response or invalid Minecraft Version",
        };
    }

    // define weirdly acting values as variables
    const motd = response.motd?.clean?.trim().replace(/\n/g, " ") ?? "Unavailable";
    const onlinePlayers = response.players?.online ?? 0;
    const maxPlayers = response.players?.max ?? 0;
    const playerList =
        response.players?.list && response.players?.list.length > 0
            ? response.players?.list.map(player => player.name_clean).join(", ")
            : response.players?.online == 0
              ? "None"
              : "Unknown";

    const imageUrl =
        edition == "java"
            ? `https://api.mcstatus.io/v2/icon/${response.host}:${response.srv_record?.port ? response.srv_record?.port : response.port}`
            : "https://minecraft.wiki/images/Unknown_server.png";
    console.log(imageUrl);

    return {
        failed: false,
        edition: edition.toLowerCase(),
        host: response.host ?? host,
        port: response.port ?? port,
        srv_record: {
            host: response.srv_record?.host,
            port: response.srv_record?.port,
        },
        online: response.online ?? false,
        image_url: imageUrl,

        version: versionName,
        motd,
        players: {
            online: onlinePlayers,
            max: maxPlayers,
            list: playerList,
        },
        raw: response,
    };
}

async function test() {
    const status = await getServerStatus("java", "questssmp.goldmonke.me");
    console.log(status);
}

test();
// console.log(getServerStatus("java", "play.cubecraft.net"));

module.exports = {
    getServerStatus,
};
