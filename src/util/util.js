// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

class Util {

    constructor() {
        throw new Error("This class may not be initiated.");
    }

    static isObject(input) {
        return input && input.constructor === Object;
    }

    static mergeDefault(def, given) {
        if (!given) return Util.deepClone(def);
        for (const key in def) {
            if (typeof given[key] === "undefined") given[key] = Util.deepClone(def[key]);
            else if (Util.isObject(given[key])) given[key] = Util.mergeDefault(def[key], given[key]);
        }

        return given;
    }

    static deepClone(source) {
        if (source === null || Util.isPrimitive(source)) return source;
        if (Array.isArray(source)) {
            const output = [];
            for (const value of source) output.push(Util.deepClone(value));
            return output;
        }
        if (Util.isObject(source)) {
            const output = {};
            for (const [key, value] of Object.entries(source)) output[key] = Util.deepClone(value);
            return output;
        }
        if (source instanceof Map) {
            const output = new source.constructor();
            for (const [key, value] of source.entries()) output.set(key, Util.deepClone(value));
            return output;
        }
        if (source instanceof Set) {
            const output = new source.constructor();
            for (const value of source.values()) output.add(Util.deepClone(value));
            return output;
        }
        return source;
    }

    static mergeObjects(objTarget = {}, objSource) {
        for (const key in objSource) objTarget[key] = Util.isObject(objSource[key]) ? Util.mergeObjects(objTarget[key], objSource[key]) : objSource[key];
        return objTarget;
    }

    /**
	 * Turn a dotted path into a json object.
	 * @since 0.5.0
	 * @param {string} path The dotted path
	 * @param {*} value The value
	 * @param {Object<string, *>} [obj = {}] The object to edit
	 * @returns {*}
	 */
    static makeObject(path, value, obj = {}) {
        if (path.indexOf(".") === -1) {
            obj[path] = value;
        } else {
            const route = path.split(".");
            const lastKey = route.pop();
            let reference = obj;
            for (const key of route) {
                if (!reference[key]) reference[key] = {};
                reference = reference[key];
            }
            reference[lastKey] = value;
        }
        return obj;
    }

}

module.exports = Util;
