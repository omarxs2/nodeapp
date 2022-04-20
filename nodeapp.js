const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
}

const replicaSet = 'mongodb://104.197.154.17:27017,35.238.178.61:27017/docker-node-mongo?replicaSet=rs0'

// Connect to MongoDB
mongoose
  .connect(
    replicaSet,
    options
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('omar: ' + err));

const Item = require('./models/item');

app.get('/', (req, res) => {
  Item.find({})
    .then(items => res.render('index', { items: items || [] }))
    .catch(err => res.status(404).json({ msg: 'No items found' }));
});

app.post('/item/add', (req, res) => {
  const newItem = new Item({
    name: req.body.name
  });

  newItem.save().then(item => res.redirect('/'));
});

const port = 3000;

app.listen(port, () => console.log('Server running...'));
