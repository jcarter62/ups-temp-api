'use strict';
let uuidV1 = require('uuid/v1');
let sqLite = require('sqlite3').verbose();

class Tokens {
    debugging = false;
    sqlitedb = '';

    constructor(locals) {
        this.debugging = locals.debugging;
        this.sqlitedb = locals.sqlitedb;
    }

    createToken(name, email) {
        let userToken = this.shortUUID();
        let keyText = this.shortUUID();
        let expire = new Date;
        expire.setDate(expire.getDate() + 30);
        let expireText = expire.toISOString();

        let returnVal = {
            token: userToken,
            name: name,
            email: email,
            expire: expireText,
            key: keyText
        };

        //
        let db = new sqLite.Database(this.sqlitedb);

        db.serialize(() => {
            let dbCreate = 'create table if not exists tokens ( ' +
                'token text, ' +
                'key text, ' +
                'name text, ' +
                'email text, ' +
                'expire numeric ) ';
            let dbInsert = 'insert into tokens values ( ?, ?, ?, ?, ? ) ';

            let stmtCreate = db.prepare(dbCreate);
            stmtCreate.run();
            stmtCreate.finalize();

            //
            let stmt = db.prepare(dbInsert);
            stmt.run(userToken, keyText, name, email, expireText);
            stmt.finalize();
        });

        this.dbg('CreateToken Return: ' + JSON.stringify(returnVal));
        db.close();
        return returnVal;
    }

    shortUUID() {
        let clockseq = Math.floor((Math.random() * 16383) + 1);
        let r1 = new Date;
        let r2 = Math.floor((Math.random() * 9999));

        const options = {
            node: [0x2F, 0x73, 0x45, 0x67, 0x89, 0xAB],
            clockseq: clockseq,
            msecs: r1,
            nsecs: r2
        };

        for (let i = 0; i < 6; i++) {
            let x = Math.floor((Math.random() * 250) + 2);
            options.node[i] = x;
        }

        let uid = uuidV1(options);
        let result = uid.replace(/-/g, '');
        this.dbg('shortUUID(): ' + result + ' / ' + JSON.stringify(options));
        return result;
    }

    dbg(msg) {
        if (debugging) {
            console.log(msg);
        }
    }
}