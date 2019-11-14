const debug = require('debug')('app:startup');
const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');
const Joi = require("joi");
const logger = require('./logger')
const authenticate = require('./authenticate');
const express = require("express");
const app = express();

app.set('view engine', 'pug');
app.set('views','./views')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());

console.log(`Application name : ${config.get(`name`)}`)
console.log(`Mail server : ${config.get(`mail.host`)}`)
console.log(`Mail Password : ${config.get(`mail.password`)}`)

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  debug(`morgan enabled ...`)
}


app.use(logger);
app.use(authenticate);
const genres = [
  { id: 1, name: "Horror" },
  { id: 2, name: "Thriller" },
  { id: 3, name: "War" },
  { id: 4, name: "Drama" }
];
app.get('/', (req, res) => {
  res.render('index',{title:'My Videos App', message:'Hello'})
})

app.get("/api/genres", (req, res) => {
  res.send(genres);
});

app.get("/api/genres/:id", (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));
  if (!genre)
    return res.status(400).send("The genre with that ID  does not exist");
  res.send(genre);
});

app.post("/api/genres", (req, res) => {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  const result = Joi.validate(req.body, schema);

  if (result.error)
    return res.status(404).send(result.error.details[0].message);
  const genre = {
    id: genres.length + 1,
    name: req.body.name
  };
  genres.push(genre);
  res.send(genre);
});

app.put("/api/genres/:id", (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));
  if (!genre)
    return res.status(400).send("The genre with that ID  does not exist");

  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  const result = Joi.validate(req.body, schema);
  if (result.error)
    return res.status(404).send(result.error.details[0].message);

  genre.name = req.body.name;
  res.send(genre);
});

app.delete("/api/genres/:id", (req, res) => {
  const genre = genres.find(g => g.id === parseInt(req.params.id));
  if (!genre)
    return res.status(400).send("The genre with that ID  does not exist");

  const index = genres.indexOf(genre);
  genres.splice(index, 1);
  res.send(genre);
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}`));
