const express = require('express');
const bodyParser = require('body-parser');

const { Client } = require('pg');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

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
        let query = 'SELECT * FROM account';
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
        let query = `
            DROP TABLE IF EXISTS "account", category, session;
            CREATE TABLE "account" (
                account_id serial,
                username varchar(255) UNIQUE NOT NULL,
                display_name varchar(255) NOT NULL,
                hashed_password varchar(255) NOT NULL,
                PRIMARY KEY (account_id)
            );
            CREATE TABLE category (
                category_id serial NOT NULL,
                account_id int NOT NULL,
                name varchar(255) NOT NULL,
                PRIMARY KEY (category_id),
                FOREIGN KEY (account_id) REFERENCES account(account_id)
            );
            CREATE TABLE session (
                session_id serial NOT NULL,
                category_id int NOT NULL,
                account_id int NOT NULL,
                start_time timestamp NOT NULL,
                end_time timestamp NOT NULL,
                PRIMARY KEY (session_id),
                FOREIGN KEY (category_id) REFERENCES category(category_id),
                FOREIGN KEY (account_id) REFERENCES account(account_id)
            );`;
        queryResult = await client.query(query);
        
        res.status(200).send('Success: Fresh tables created');
    } catch (err) {
        next(err);
        return;
    }
});

app.get('/aha', async (req, res, next) => {
    try {
        res.status(200).sendFile(__dirname + '/aha.html');
    } catch (err) {
        next(err);
        return;
    }
});

app.post('/aha', async (req, res, next) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let values = [username, username, password];
        let query = `
            INSERT INTO account (username, display_name, hashed_password)
            VALUES ($1, $2, $3)
        `;
        let queryResult = await client.query(query, values);
        res.status(200).redirect('/');
    } catch (err) {
        next(err);
        return;
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${ port }`);
});
