import initSqlJs from '../sql-wasm.js';

const INITIAL_DATA = [
    {
        username: "Pracownik",
        password: "haslo@123"
    },
    {
        username: "Krzysztof",
        password: "abcd"
    },
    {
        username: "Wojciech",
        password: "Egzamin"
    }
];

const flatter = (users) => {
    let mapped = users.map(user=>[user.username, user.password]);
    return mapped.flat();
}

let DB;


const runServer = async () => {
    const config = {locateFile: filename => `../${filename}`}
    
    const migrateDB = (data) => {
        DB.run("CREATE TABLE users (username, password);");
        DB.run(`INSERT INTO users VALUES (?,?), (?,?), (?,?)`, flatter(data));
        // TODO: ^ improve this so we can use lenght instead
    }
    
    initSqlJs(config).then((SQL) => {
        DB = new SQL.Database();
        migrateDB(INITIAL_DATA);

        const stmt = DB.prepare("SELECT * FROM users");
        stmt.getAsObject({ $start: 1, $end: 1 }); // {col1:1, col2:111}

        // Bind new values
        stmt.bind({ $start: 1, $end: 2 });
        while (stmt.step()) { //
            var row = stmt.getAsObject();
            console.log('Here is a row: ' + JSON.stringify(row));
        }
    });
}

runServer();
