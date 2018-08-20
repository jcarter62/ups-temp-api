let sqlite3 = require('sqlite3').verbose();

class DB {
  constructor(res, user, pass ) {
    this.res = res;
    this.user = user;
    this.pass = pass;
    let db = new sqlite3.Database('./dbfiles/data.db');
    this.authUser();
  }

  authUser() {
    db.serialize((  ) => {
        db.all('select * from users', (err, results) => {
          res.send(results);
          console.log(results);
        });
      }
    )
  }
}

