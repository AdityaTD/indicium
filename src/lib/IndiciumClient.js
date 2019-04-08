const fs = require("fs-nextra");
const path = require("path");
const util = require("./util/util");

const { DEFAULTS } = require("../util/constants");

const Table = require("./structures/Table");

class Indicium {

    constructor(options = {}) {
        if (!util.isObject(options)) throw new TypeError("The Client options must be an object.");
        options = util.mergeDefault(DEFAULTS.CLIENT, options);

        this.production = options.production;

        this.dbDirectory = path.resolve(path.dirname(require.main.filename), "indicium", options.database);
        this.tables = new Map();

        this.ready = false;
        this.init();
    }

    /**
	 * Creates a new table in the database
     * @since 0.0.1
	 * @param {string} table The name for the new table
	 * @returns {void}
	 */
    createTable(table) {
        if (!this.ready) throw "[CLIENT] IndiciumClient has not been initialized.";
        if (this.hasTable(table)) throw "[TABLE] This table name already exists in the database.";
        this.tables.set(table, new Table({ tableName: table }));
        return fs.mkdir(path.resolve(this.dbDirectory, table));
    }

    /**
	 * Deletes the table from the database
     * @since 0.0.1
	 * @param {string} table The table name to delete
	 * @returns {void}
	 */
    deleteTable(table) {
        return this.hasTable(table)
            .then(exists => exists ? fs.emptyDir(path.resolve(this.dbDirectory, table)).then(() => fs.remove(path.resolve(this.dbDirectory, table)) && this.tables.delete(table)) : null);
    }

    /**
	 * Check if a table exists in the database
     * @since 0.0.1
	 * @param {string} table The name for the table
	 * @returns {Promise<void>}
	 */
    hasTable(table) {
        return this.tables.has(table);
    }

    /**
     * Loads all the tables into the database
     * @since 0.0.1
     * @returns {Promise<string>}
     * @protected
     */
    async loadTables() {
        const tables = await fs.readDir(this.dbDirectory).filter(file => fs.stat(`${this.dbDirectory}/${file}`).isDirectory());
        if (!tables) console.log("[TABLE] 0 Tables loaded.");
        for (const table of tables) {
            const newTable = new Table({ tableName: table });
            this.tables.set(table, newTable);
        }
        console.log(`[TABLE] ${this.tables.size} Tables loaded.`);
    }

    async init() {
        await this.loadTables();
        this.ready = true;
    }

}

module.exports = Indicium;
