const express = require('express');
const bodyParser = require('body-parser');


const { Client } = require('pg');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.all('/*', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://endlessarcade.herokuapp.com');
  res.setHeader('Access-Control-Allow-Origin', 'http://endlessarcade.herokuapp.com');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

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

        res.status(200).send(JSON.stringify(queryResult.rows));
    } catch (err) {
        next(err);
        return;
    }
});

app.get('/hs', async (req, res, next) => {
  try {
      let options = req.query;
      let query = '';
      if (options.hasOwnProperty('gameName')) {
        query = `
            SELECT * FROM score
            JOIN game ON score.game_id = game.game_id
            WHERE game.game_name = $1
            ORDER BY score_number DESC
            LIMIT $2
        `;
        let limitCount = 10;
        if (options.hasOwnProperty('count')) {
          limitCount = options.count;
        }
        let queryResult = await client.query(query, [options.gameName, limitCount]);
        res.status(200).send(JSON.stringify(queryResult.rows));
      } else {
        res.status(200).send('Howdy, try setting an option!');
      }
  } catch (err) {
      next(err);
      return;
  }
});

app.post('/hs', async (req, res, next) => {
  try {
      let options = req.body;
      // tries to find the game id given the game name
      let query = `
        SELECT game_id FROM game
        WHERE game_name = $1
      `;
      let queryResult = await client.query(query, [options.gameName]);
      // creates the game in the game table if doesnt exist
      if (queryResult.rows.length == 0) {
        query = `
          INSERT INTO game (game_name)
          VALUES ($1)
        `;
        queryResult = await client.query(query, [options.gameName]);
      }
      let gameId = queryResult.rows[0].game_id;
      // now posts the score to the score table
      query = `
        INSERT INTO score (game_id, score_name, score_number)
        VALUES ($1, $2, $3)
      `;
      queryResult = await client.query(query, [gameId, options.scoreName, options.scoreNumber]);
      res.status(200).send(JSON.stringify(queryResult.rows));
  } catch (err) {
      next(err);
      return;
  }
});

app.get('/init', async (req, res, next) => {
    try {
        let data = [];
        let dataCount = 1;
        let query = `
            DROP TABLE IF EXISTS account, category, session, game, score;
            `;
        query += `
            CREATE TABLE account (
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
            );
            CREATE TABLE game (
                game_id serial NOT NULL,
                game_name varchar(255) NOT NULL,
                PRIMARY KEY (game_id)
            );
            CREATE TABLE score (
                score_id serial NOT NULL,
                game_id int NOT NULL,
                score_name varchar(255) NOT NULL,
                score_number int NOT NULL,
                PRIMARY KEY (score_id),
                FOREIGN KEY (game_id) REFERENCES game(game_id)
            );

        `;
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
