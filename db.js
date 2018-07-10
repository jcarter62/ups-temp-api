let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./data.sqlite');

module.exports = {
  sites: [],

  init: () => {
    db.serialize(() => {
        db.run('create table sites (' +
          'name text, ' +
          'ip text, ' +
          'nameoid text, ' +
          'locationoid text, ' +
          'tempoid text, ' +
          'warn float,' +
          'alarm float ');
      }
    )
  }


};

