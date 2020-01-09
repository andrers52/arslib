import Assert from '../assert.js'

// Usage example:
// import Persistence
// start service: namespace serves to separate apps
// Persistence.configure(<namespace>,'ent1','ent2',..., 'entN')
// Persistence.ent1 = <value>
// result = Persistence.ent1

class Persistence {

  static configure(namespace, ...entities) {
    Assert.assert(!Persistence.entities,
      'Persistence#configure can only be called once'
    )
    Persistence.namespace = namespace
    Persistence.entitiesToValues = {}
    entities.forEach(entity => {
      // initialize mapping
      Persistence.entitiesToValues[entity] =
        Persistence.retrieve(entity)
      // create getter and setter
      Object.defineProperty(
        Persistence,
        entity, {
          get: () => 
            Persistence.entitiesToValues[entity],
          set: value => {
            Persistence.entitiesToValues[entity] =
              Object.assign({}, value)
            setTimeout(
              () => {
                Persistence.save(entity, value)
              },
              0.1
            )
          }
        }
      )
    })
  }


  static retrieve(entity) {
    return JSON.parse(
      window.localStorage.getItem(
        `${Persistence.namespace}:${entity}`
      )
    )
  }

  static save(entity, value) {
    window.localStorage.setItem(
      `${Persistence.namespace}:${entity}`,
      JSON.stringify(value)
    )
  }
}

export {Persistence as default}
export {Persistence}
