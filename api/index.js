const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/user_model');

dotenv.config();
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

connectDB();

const jwtSecret = process.env.JWT_SECRET_KEY;
const bcryptSalt = bcrypt.genSaltSync(10);


const app = express();
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
  }));
  

app.get('/test', (req,res) => {
    res.json('test ok');
  });

  app.get('/profile', (req,res) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        res.json(userData);
      });
    } else {
      res.status(401).json('no token');
    }
  });

  app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if (foundUser) {
      const passOk = bcrypt.compareSync(password, foundUser.password);
      if (passOk) {
        jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
          res.cookie('token', token, {sameSite:'none', secure:true}).json({
            id: foundUser._id,
          });
        });
      }
    }
  });

  app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try{
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
        username:username,
        password:hashedPassword,
      });
        jwt.sign({userId:createdUser._id,username}, jwtSecret, {},(err, token) => {
        if (err) throw err;
        res.cookie('token', token,{sameSite:'none', secure:true}).status(201).json({
            id: createdUser._id,
          });
        });
    }
    catch(err) {
        if (err) throw err;
        res.status(500).json('error');
      }
    });

    const PORT = 4040;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    //a5p51iFeF9UbVTZ2