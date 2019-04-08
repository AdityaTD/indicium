const fs = require("fs-nextra");
const path = require("path");
const util = require("../util/util");

const Table = require("./Table");

class Database {

    constructor(options = {}) {
        if (!util.isObject(options)) throw new TypeError("The Table options must be an object.");

        this.name = options.database || "indicium";

        this.path = options.path;
        this.dir = path.resolve(this.path, this.name);

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
        this.tables.set(table, new Table({ database: this.name, tableName: table }));
        return fs.mkdir(path.resolve(this.dir, table));
    }

    /**
	 * Deletes the table from the database
     * @since 0.0.1
	 * @param {string} table The table name to delete
	 * @returns {void}
	 */
    deleteTable(table) {
        return this.hasTable(table)
            .then(exists => exists ? fs.emptyDir(path.resolve(this.dir, table)).then(() => fs.remove(path.resolve(this.dir, table)) && this.tables.delete(table)) : null);
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
        const tables = await fs.readDir(this.dir).filter(file => fs.stat(`${this.dir}/${file}`).isDirectory());
        if (!tables) console.log("[TABLE] 0 Tables loaded.");
        for (const table of tables) {
            const newTable = new Table({ database: this.databaseName, tableName: table });
            this.tables.set(table, newTable);
        }
        console.log(`[TABLE] ${this.tables.size} Tables loaded.`);
    }

    async init() {
        await this.loadTables();
        this.ready = true;
    }

}

module.exports = Database;
