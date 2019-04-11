const express = require('express');

const { Client } = require('pg');

const app = express();

const port = process.env.PORT || 5000;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

client.connect()
    .then(() => console.log('Connected to the database.'))
    .catch((err) => console.log(err));

app.get('/', async (req, res, next) => {
    try {
        let query = 'SELECT * FROM Values';
        let queryResult = await client.query(query);

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

app.get('/init', async (req, res, next) => {
    try {
        let query = 'DROP TABLE IF EXISTS values';
        let queryResult = await client.query(query);
        query = `CREATE TABLE values (
            value_id serial PRIMARY KEY,
            value integer
        )`;
        queryResult = await client.query(query);
        res.status(200).send('Success: Created fresh tables');
    } catch (err) {
        next(err);
        return;
    }
});

app.get('/aha', async (req, res, next) => {
    try {
        const rando = Math.floor(Math.random() * 100000);
        const query = `INSERT INTO values (value) VALUES (${rando})`;

        const queryResult = await client.query(query);


        res.status(200).send('Success: Inserted ' + rando + '</br>');

    } catch (err) {
        next(err);
        return;
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${ port }`);
});
