const Promise = require('bluebird');
const Datastore = require('nedb');

/**
 * @class nedb
 */
export default class {

  /**
   * Accepts config parameters, constructs class
   * @memberof nedb
   * @param {Object} cfg Configuration
   */
  constructor (config) {
    this.db = Promise.promisifyAll(new Datastore(config));
    return true;
  }

  /**
   * Creates a new entry in the database
   * @memberof nedb
   * @param {Object} body Contents to create entry
   * @param {String|Number} [version] The version of the model to use
   * @returns {Object} promise
   */
  create (body, version = false) {
    return this.validate(body, version)
      .then(data => this.db.insertAsync(data));
  }

  /**
   * Reads from the database
   * @memberof nedb
   * @param {Object} query Specific id or query to construct read
   * @param {Number|String} version The version of the model to match
   * @returns {Object} promise
   */
  read (query, version = false) {
    return new Promise((resolve) => {
      this.db.findAsync(query)
        .then((results) => {
          const tmp = [];
          results.forEach((r) => {
            tmp.push(this.sanitize(r, version));
          });
          resolve(tmp);
        });
    });
  }

  /**
   * Updates an entry in the database
   * @memberof nedb
   * @param {String} query Query to locate entries to update
   * @param {Object} body Contents to update
   * @param {String|Number} [version] The version of the model to use
   * @returns {Object} promise
   */
  update (query, body, version = false) {
    return this.validate(body, version)
      .then(data => this.db.updateAsync(query, { $set: data }, { multi: true }));
  }

  /**
   * Deletes an item from the database
   * @memberof nedb
   * @param {Object} query Query to locate entries to delete
   * @returns {Object} promise
   */
  delete (query) {
    return this.db.removeAsync(query, { multi: true });
  }

  /**
   * Extends adapter by adding new method
   * @memberof nedb
   * @param {String} name The name of the method
   * @param {Function} fn The method to add
   */
  extend (name, fn) {
    this[name] = fn.bind(this);
  }

}
