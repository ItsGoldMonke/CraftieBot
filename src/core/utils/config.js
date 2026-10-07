const config = {
    apiUrls: {
        playerHead: "https://api.mcheads.org/head/${uuid}/${size}",
        playerBody: "https://api.mcheads.org/player/${uuid}/${size}",
        playerData: "https://playerdb.co/api/player/minecraft/${uuidOrUsername}",
        serverIcon:
            "https://api.mcstatus.io/v2/icon/${response.host}:${response.srv_record?.port ? response.srv_record?.port : response.port}",
    },
    defaults: {
        javaDefaultPort: 25565,
        bedrockDefaultPort: 19132,
        timeout: 5000,
        defaultServerIcon: "https://minecraft.wiki/images/Unknown_server.png",
    },
    images: {
        font: "MinecraftDefault-Regular.ttf",
        size: {
            width: 800, // Default 800, minimum 400
            height: 400, // Default 400, minimum 200
        },
    },
};

module.exports = config;
