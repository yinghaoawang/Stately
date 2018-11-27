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

app.get('/aha', (req, res) => {
    const rando = Math.floor(Math.random() * 100000);
    res.send(rando);
});

app.listen(port, () => {
    console.log(`Listening on port ${ port }`);
});
