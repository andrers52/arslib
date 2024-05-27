import { Assert } from "./assert.js";

// Usage example:
// import { Persistence }
// start service: namespace serves to separate apps
// persistence = new Persistence(<namespace>,'ent1','ent2',..., 'entN')
// persistence.ent1 = <value>
// result = persistence.ent1

class Persistence {
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

  retrieve(entity) {
    return JSON.parse(
      window.localStorage.getItem(`${this.namespace}:${entity}`),
    );
  }

  save(entity, value) {
    window.localStorage.setItem(
      `${this.namespace}:${entity}`,
      JSON.stringify(value),
    );
  }
}

export { Persistence };
