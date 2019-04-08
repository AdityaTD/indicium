module.exports.DEFAULTS = {
    CLIENT: {
        database: "indicium",
        // eslint-disable-next-line no-process-env
        production: process.env.NODE_ENV === "production"
    }
};
