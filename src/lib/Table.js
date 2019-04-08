const fs = require("fs-nextra");
const path = require("path");
const util = require("../util/util");

class Table {

    constructor(options = {}) {
        if (!util.isObject(options)) throw new TypeError("The Table options must be an object.");

        this.database = options.database;
        this.tableName = options.tableName;

        this.tableDirectory = path.resolve(path.dirname(require.main.filename), "indicium", this.database, this.tableName);

        this.cache = new Map();

        this.ready = false;
        this.init();
    }

    /**
     * All entries of the table
     * @since 0.0.1
     * @returns {Array<key, value>}
     */
    entries() {
        if (!this.ready) throw `[TABLE] ${this.tableName} table is not yet ready`;
        if (this.cache.size) return this.cache.entries;
    }

    /**
	 * Check if a key document exists in the table
     * @since 0.0.1
	 * @param {string} key The document name
	 * @returns {Promise<boolean>}
	 */
    has(key) {
        if (!this.ready) throw `[TABLE] ${this.tableName} table is not yet ready`;
        if (this.cache.has(key)) return true;
        return fs.pathExists(path.resolve(this.tableDirectory, `${key}.json`));
    }

    /**
	 * Get a key from the table
     * @since 0.0.1
	 * @param {string} key The document name
	 * @returns {Promise<?Object>}
	 */
    async get(key) {
        if (!this.ready) throw `[TABLE] ${this.tableName} table is not yet ready`;
        if (this.cache.has(key)) return this.cache.get(key);
        if (!fs.pathExists(path.resolve(this.tableDirectory, `${key}.json`))) throw `[TABLE] ${this.tableName} table does not have '${key}' record.`;
        const data = await fs.readJSON(path.resolve(this.tableDirectory, `${key}.json`));
        if (data) {
            this.cache.set(key, data);
            return data;
        }
        return null;
    }

    /**
	 * Update a record in the table
     * @since 0.0.1
	 * @param {string} key The document name
	 * @param {Object} data The object with all the properties you want to update
	 * @returns {void}
	 */
    async update(key, data) {
        const existent = await this.get(key);
        const updated = util.mergeObjects(existent, this.parseUpdateInput(data));
        fs.outputJSONAtomic(fs.resolve(this.tableDirectory, `${key}.json`), updated);
        return this.cache.set(key, updated);
    }

    /**
	 * Parse the gateway input for easier operation
	 * @since 0.0.1
	 * @param {(Object<string, *>|SettingsUpdateResult[])} data The updated entries
	 * @returns {Object<string, *>}
	 * @protected
	 */
    parseUpdateInput(data) {
        if (util.isObject(data)) return data;
        const updateObject = {};
        for (const entry of data) util.mergeObjects(updateObject, util.makeObject(entry.data[0], entry.data[1]));
        return updateObject;
    }

    /**
	 * Load the records into cache for a table
     * @since 0.0.1
	 * @returns {Promise<string>}
     * @protected
	 */
    async loadCache() {
        if (this.ready) throw `[TABLE] ${this.tableName} table is already ready`;
        if (!fs.pathExists(this.tableDirectory)) throw `[TABLE] ${this.tableName} table doesn't exist.`;
        const files = await fs.readdir(this.tableDirectory);
        for (const file of files) {
            if (!file.endsWith(".json")) continue;
            const json = await fs.readJSON(path.resolve(this.tableDirectory, file)).catch(() => null);
            if (!json) continue;
            this.cache.set(file.slice(0, file.length - 5), json);
        }
        return console.log(`[TABLE] ${this.tableName} table loaded with ${this.cache.size} records.`);
    }

    async init() {
        await this.loadCache();
        this.ready = true;
    }

}

module.exports = Table;
