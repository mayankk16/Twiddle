const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/user_model');

dotenv.config();
mongoose.connect(process.env.MONGO_URL,(err) => {
    if (err) throw err;
  });
const jwtSecret = process.env.JWT_SECRET_KEY;

const app = express();
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }));
  

app.get('/test', (req,res) => {
    res.json('test ok');
  });

  app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try{
        const createdUser = await User.create({username,password});
        jwt.sign({userId:createdUser._id}, jwtSecret, {},(err, token) => {
        if (err) throw err;
        res.cookie('token', token).status(201).json({
            id: createdUser._id,
          });
        });
    }
    catch(err) {
        if (err) throw err;
        res.status(500).json('error');
      }
    });


  app.listen(8000);

  //HOfDgikPYtraBSll