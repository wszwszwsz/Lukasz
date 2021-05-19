import CryptoJS from "crypto-js";
import fs from "fs";
import http from 'http';
import initSqlJs from '../sql-wasm.js';
import querystring from 'querystring';
import url from "url";

const SECRET_PASSWORD = "wszwsz";
let DB;

const utils = {
    encrypt: (pass) => CryptoJS.AES.encrypt(pass, SECRET_PASSWORD).toString(),

    decrypt: (cypher) => {
        let bytes = CryptoJS.AES.decrypt(cypher, SECRET_PASSWORD);
        return bytes.toString(CryptoJS.enc.Utf8)
    },

    flatter: (users) => {
        let mapped = users.map(user => [user.username, utils.encrypt(user.password)]);
        return mapped.flat();
    },

    saveDB: (name) => {
        let data = DB.export();
        let buffer = new Buffer.from(data);
        fs.writeFileSync(`${name}.sqlite`, buffer);
    },

    // migrateDB: (data, name="wsz") => {
    //     if(data.length > 0) {
    //         DB.run("CREATE TABLE users (username, password);");
    //         DB.run(`INSERT INTO users VALUES (?,?), (?,?), (?,?)`, utils.flatter(data));
    //     } else {
    //         initSqlJs(CONFIG).then((SQL) => {
    //             DB = new SQL.Database(filebuffer);
    //         });
    //     }

    //     // TODO: ^ improve this so we can use lenght instead
    // },
}

// TODO: Add hash from env file
// console.log(process.env.our_super_secret_key)

const runServer = async () => {
    const hostname = '127.0.0.1';
    const port = 8001;
    runDatabase("wsz");

    const server = http.createServer((req, res) => {
        const queryObject = url.parse(req.url,true).query;
        console.log(queryObject)

        if (req.url === '/passwords' && req.method === 'GET') {
            let passwords = [];
            const statement = DB.prepare("SELECT * FROM users");
            statement.bind({ $start: 1, $end: 2 });
            while (statement.step()) {
                let row = statement.getAsObject();
                passwords = [...passwords, utils.decrypt(row.password)];
            }
            statement.free();

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(passwords));
        }

        if (req.url === '/users' && req.method === 'GET') {
            let users = [];
            const statement = DB.prepare("SELECT * FROM users");
            statement.bind({ $start: 1, $end: 2 });
            while (statement.step()) {
                let row = statement.getAsObject();
                users = [...users, row];
            }
            statement.free();

            res.statusCode = 200;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'text/plain');
            res.end(JSON.stringify(users));
        }

        if(req.url === '/auth' && req.method === 'GET') {
            const queryObject = url.parse(req.url,true).query;
            
            // TODO: write down the DB query for the users

            res.statusCode = 200;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'text/plain');
            res.end("yeah!");
        }

        // if (req.url === `/users` && req.method === 'GET') {
            // IF HAS PARAMS go for specific one
            // console.log("hit!")
            
            
            // let user;
            // const statement = DB.prepare(`SELECT * FROM users WHERE id=${req.query.id}`);
            // statement.bind({ $start: 1, $end: 2 });
            // while (statement.step()) {
            //     let row = statement.getAsObject();
            //     user = row;
            // }
            // statement.free();

            // res.statusCode = 200;
            // res.setHeader('Access-Control-Allow-Origin', '*');
            // res.setHeader('Content-Type', 'text/plain');
            // res.end(JSON.stringify(user));
        // }
    });

    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}

const runDatabase = async (name) => {
    const CONFIG = { locateFile: filename => `../${filename}` }
    const initial_db = fs.readFileSync(`${name}.sqlite`);

    initSqlJs(CONFIG).then((SQL) => {
        DB = new SQL.Database(initial_db);

        utils.saveDB(name);
    });
}

runServer();

export { runDatabase, runServer, utils };