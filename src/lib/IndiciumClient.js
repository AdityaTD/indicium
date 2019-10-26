const fs = require("fs-nextra");
const path = require("path");
const util = require("../util/util");

const Database = require("./Database");

class Indicium {

    constructor(options = {}) {
        if (!util.isObject(options)) throw new TypeError("The Client options must be an object.");

        this.path = options.path || path.resolve(process.cwd(), "bwd", options.directory || "data");
        this.production = options.production || process.env.NODE_ENV === "production";

        this.databases = new Map();

        this.ready = false;
        this.init();
    }

    /**
	 * Creates a new database
     * @since 0.0.1
	 * @param {string} database The name for the new database
	 * @returns {void}
	 */
    createDatabase(database) {
        if (!this.ready) return console.log("[CLIENT] IndiciumClient is not ready yet.");
        if (this.hasDatabase(database)) return console.log("[DATABASE] This database name already exists.");
        this.databases.set(database, new Database({ database: database, path: this.path }));
        return fs.mkdir(path.resolve(this.path, database));
    }

    /**
	 * Deletes the database
     * @since 0.0.1
	 * @param {string} database The table name to delete
	 * @returns {void}
	 */
    deleteDatabase(database) {
        if (!this.ready) return console.log("[CLIENT] IndiciumClient is not ready yet.");
        return this.hasDatabase(database)
            .then(exists => exists ? fs.emptyDir(path.resolve(this.path, database)).then(() => fs.remove(path.resolve(this.path, database)) && this.databases.delete(database)) : null);
    }

    /**
	 * Check if a database exists
     * @since 0.0.1
	 * @param {string} database The name for the table
	 * @returns {Promise<void>}
	 */
    hasDatabase(database) {
        if (!this.ready) throw "[CLIENT] IndiciumClient is not ready yet.";
        return this.databases.has(database);
    }

    /**
     * Loads all the databases to client
     * @since 0.0.1
     * @returns {Promise<string>}
     * @protected
     */
    async loadDatabases() {
        if (!await fs.pathExists(this.path)) await fs.mkdir(path.resolve(this.path));

        const databases = await fs.readdir(this.path);
        const filtered = databases.filter(async folder => {
            const f = await fs.stat(`${this.path}/${folder}`);
            return f.isDirectory();
        });

        if (!filtered.length) console.log("[DATABASE] 0 Databases loaded.");
        for (const database of filtered) {
            const newDatabase = new Database({ database: database, path: this.path });
            this.databases.set(database, newDatabase);
        }
        console.log(`[DATABASE] ${this.databases.length} Databases loaded.`);
    }

    async init() {
        await this.loadDatabases();
        this.ready = true;
        if (!this.databases.size) await this.createDatabase("indicium");
    }

}

module.exports = Indicium;
