import { Assert } from "../assert.js";
import { Platform } from "../platform.js";

/**
 * Persistence utility for managing localStorage with automatic serialization
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

let Persistence = {};

if (!Platform.isNode()) {
  const instances = {}; // To store instances per namespace

  /**
   * Creates or retrieves a Persistence instance with specified entities for a given namespace.
   * This function ensures that for each namespace, there's only one Persistence object managing its entities.
   * @param {string} namespace - Namespace to separate different apps in localStorage.
   * @param {...string} entities - Entity names to create persistent properties for.
   * @returns {object} The Persistence instance for the given namespace.
   */
  Persistence.getInstance = function (namespace, ...entities) {
    if (!instances[namespace]) {
      instances[namespace] = createPersistenceInstance(namespace, ...entities);
    }
    // Optionally, update entities if new ones are provided, though typically entities are defined at initialization.
    // This part might need refinement based on how dynamic entity management is envisioned.
    return instances[namespace];
  };

  function createPersistenceInstance(namespace, ...entities) {
    Assert.assert(namespace, "Namespace must be provided.");
    const entitiesToValues = {};

    const instance = {
      namespace,
      entitiesToValues,
      retrieve: function (entity) {
        return JSON.parse(
          window.localStorage.getItem(`${this.namespace}:${entity}`),
        );
      },
      save: function (entity, value) {
        window.localStorage.setItem(
          `${this.namespace}:${entity}`,
          JSON.stringify(value),
        );
      },
    };

    entities.forEach((entity) => {
      // initialize mapping
      instance.entitiesToValues[entity] = instance.retrieve(entity);
      // create getter and setter on the instance object
      Object.defineProperty(instance, entity, {
        get: () => instance.entitiesToValues[entity],
        set: (value) => {
          instance.entitiesToValues[entity] = Object.assign({}, value);
          setTimeout(() => {
            instance.save(entity, value);
          }, 0.1); // Consider making this configurable or removing timeout if not strictly needed
        },
        configurable: true, // Important for re-definition if necessary, though ideally not needed
        enumerable: true,
      });
    });

    return instance;
  }
}

export { Persistence };
