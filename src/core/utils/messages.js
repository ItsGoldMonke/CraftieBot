const messages = {
    errors: {
        invalidArgs: "Status not generated. Please provide a UUID or username.",
        noUserFound: "Status not generated. Player does not exists. (or an error occurred)",
        playerFetchFailed:
            "Failed to fetch. Please ensure the player exists and your command is correct. Otherwise, the bot may be experiencing issues.",
        serverFetchFailed:
            "Failed to fetch. Please ensure the server is online and the host/port are correct. Otherwise, the server may be experiencing issues.",
    },
    slack: {
        remindUsage: "Usage: /craftie-status (java|bedrock) <host> [port]",
    },
    discord: {
        embedFooter: "From Craftie, a bot built by <@758275913821192202>",
    },
};

module.exports = messages;
