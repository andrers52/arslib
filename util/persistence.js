import { Assert } from "./assert.js";

/**
 * Persistence utility class for managing localStorage with automatic serialization
 * @example
 * // import { Persistence }
 * // start service: namespace serves to separate apps
 * // persistence = new Persistence(<namespace>,'ent1','ent2',..., 'entN')
 * // persistence.ent1 = <value>
 * // result = persistence.ent1
 */
// Usage example:
// import { Persistence }
// start service: namespace serves to separate apps
// persistence = new Persistence(<namespace>,'ent1','ent2',..., 'entN')
// persistence.ent1 = <value>
// result = persistence.ent1

class Persistence {
  /**
   * Creates a new Persistence instance with specified entities
   * @param {string} namespace - Namespace to separate different apps in localStorage
   * @param {...string} entities - Entity names to create persistent properties for
   */
  constructor(namespace, ...entities) {
    Assert.assert(
      !this.entities,
      "Persistence#configure can only be called once",
    );
    this.namespace = namespace;
    this.entitiesToValues = {};
    entities.forEach((entity) => {
      // initialize mapping
      this.entitiesToValues[entity] = this.retrieve(entity);
      // create getter and setter
      Object.defineProperty(Persistence, entity, {
        get: () => this.entitiesToValues[entity],
        set: (value) => {
          this.entitiesToValues[entity] = Object.assign({}, value);
          setTimeout(() => {
            this.save(entity, value);
          }, 0.1);
        },
      });
    });
  }

  /**
   * Retrieves a value from localStorage for the given entity
   * @param {string} entity - Entity name to retrieve
   * @returns {any} Parsed value from localStorage, or null if not found
   */
  retrieve(entity) {
    return JSON.parse(
      window.localStorage.getItem(`${this.namespace}:${entity}`),
    );
  }

  /**
   * Saves a value to localStorage for the given entity
   * @param {string} entity - Entity name to save
   * @param {any} value - Value to save (will be JSON stringified)
   */
  save(entity, value) {
    window.localStorage.setItem(
      `${this.namespace}:${entity}`,
      JSON.stringify(value),
    );
  }
}

export { Persistence };
