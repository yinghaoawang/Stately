const express = require('express');

const { Client } = require('pg');

const app = express();

const port = process.env.PORT || 5000;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

console.log(process.env.DATABASE_URL);

client.connect()
    .then(() => console.log('Connected to the database.'))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    const query = 'SELECT * FROM Values';

    client.query(query, function(err, result) {
        if (err) {
            res.send(err);
        } else {
            let str = JSON.stringify(result.rows[0]) + "\n";
            res.send(str);
        }
    });
});

app.get('/aha', (req, res) => {
    const rando = Math.floor(Math.random() * 100000);

    const query = `INSERT INTO values (value) VALUES (${rando})`;

    client.query(query, function(err, result) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log(result);
            let str = JSON.stringify(result.rows[0]) + "\n";
            res.send(rando + '\n' + str);
        }
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${ port }`);
});
