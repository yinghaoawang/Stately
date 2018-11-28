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

app.get('/', async (req, res, next) => {
    try {
        const query = 'SELECT * FROM Values';

        const queryResult = await client.query(query);

        let str = "";
        for (let i = 0; i < queryResult.rows.length; ++i) {
            str += JSON.stringify(queryResult.rows[i]) + '</br>';
        }
        res.status(200).send(str);
    } catch (err) {
        next(err);
        return;
    }
});

app.get('/aha', async (req, res, next) => {
    try {
        const rando = Math.floor(Math.random() * 100000);
        const query = `INSERT INTO values (value) VALUES (${rando})`;

        const queryResult = client.query(query);


        res.status(200).send('Success: Inserted ' + rando + '</br>');

    } catch (err) {
        next(err);
        return;
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${ port }`);
});
