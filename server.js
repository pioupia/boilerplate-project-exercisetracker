const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require("body-parser");

require('dotenv').config();
const users = [];
const excercices = [];

app.use(cors())
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", (req, res) => {
  return res.json(users);
});

app.get("/api/users/:id/logs", (req, res) => {
  const id = req.params.id;
  const f = users.find(r => r._id === id);
  if(!f) return res.send('Cast to ObjectId failed for value "'+id+'" at path "_id" for model "Users"');
  const queryFrom = new Date(req.query.from || 0);
  const queryTo = new Date(req.query.to || Date());
  const queryLimit = parseInt(req.query.limit || 0);
  const from = queryFrom == 'Invalid Date' ? new Date(0) : queryFrom
  const to = queryTo == 'Invalid Date' ? new Date() : queryTo
  let f2 = excercices.filter(r => {
    const date = new Date(r.date)
    return r._id === id && date >= from && date <= to;
    });
  f2 = f2.slice(0, queryLimit ? queryLimit : f2.length);
  const data = {
    username: f.username,
    count: f2.length,
    _id: f._id,
    log:[]
  };

  f2.map(r =>data.log.push(
    {description: r.description, duration: r.duration, date: r.date}));

  return res.json(data);
});

app.post('/api/users', (req, res) => {
  if(!req.body || !req.body.username) return res.send('Path `username` is required.');
  if(users.find(r => r.username === req.body.username)) return res.send('Username already taken');
  const _id = Date.now().toString(12);
  users.push({
    username: req.body.username,
    _id
  });
  return res.json({
    username: req.body.username,
    _id
  });
});

app.post('/api/users/:id/exercises', (req, res) => {
  let { description, duration, date } = req.body;
  const uid = req.params.id || req.body[':_id'];
  if(!uid || !users.find(r => r._id === uid)) return res.send('Not found');
  if(!description) return res.send('Path `description` is required.')
  if(!duration) return res.send('Path `duration` is required.')
  if(isNaN(duration)) return res.send(`Cast to Number failed for value "${duration}" at path "duration"`);
  if(!date){
    date = Date.now();
  }
  const d = new Date(date);
  const f = users.find(r => r._id === uid);
  const data = {
    username: f.username,
    description: description,
    duration: parseInt(duration),
    date: d.toDateString(),
    _id: uid
  }
  excercices.push(data)
  return res.json(data);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + process.env.PORT || 3000);
})