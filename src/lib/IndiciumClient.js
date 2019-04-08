const fs = require("fs-nextra");
const path = require("path");

const Database = require("./Database");

class Indicium {

    constructor(options = {}) {
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
        if (!this.ready) throw "[CLIENT] IndiciumClient is not ready yet.";
        if (this.hasDatabase(database)) throw "[DATABASE] This database name already exists.";
        this.tables.set(database, new Database({ database: database }));
        return fs.mkdir(path.resolve(this.path, database));
    }

    /**
	 * Deletes the database
     * @since 0.0.1
	 * @param {string} database The table name to delete
	 * @returns {void}
	 */
    deleteDatabase(database) {
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
        return this.databases.has(database);
    }

    /**
     * Loads all the databases to client
     * @since 0.0.1
     * @returns {Promise<string>}
     * @protected
     */
    async loadDatabases() {
        const databases = await fs.readDir(this.path).filter(folder => fs.stat(`${this.path}/${folder}`).isDirectory());
        if (!databases) console.log("[DATABASE] 0 Databases loaded.");
        for (const database of databases) {
            const newDatabase = new Database({ database: database });
            this.tables.set(database, newDatabase);
        }
        console.log(`[DATABASE] ${this.databases.size} Databases loaded.`);
    }

    async init() {
        await this.loadDatabases();
        this.ready = true;
    }

}

module.exports = Indicium;
