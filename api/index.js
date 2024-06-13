const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const User = require('./models/user_model.js');
const Message = require('./models/message_model.js');
const ws=require('ws');
const fs = require('fs');

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
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    // origin: process.env.CLIENT_URL,
    origin: 'http://localhost:5173'
  }));

  // app.use((req, res, next) => {
  //   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  //   res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
  //   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Origin, Authorization');
  //   next();
  // });
  

app.get('/test', (req,res) => {
    res.json('test ok');  
  });

  // app.get('/profile', (req,res) => {
  //   const token = req.cookies?.token;
  //   if (token) {
  //     jwt.verify(token, jwtSecret, {}, (err, userData) => {
  //       if (err) throw err;
  //       res.json(userData);
  //     });
  //   } else {
  //     res.status(401).json('no token');
  //   }
  // });
//   app.get('/profile', async (req, res) => {
//     const token = req.cookies?.token;
//     if (token) {
//         try {
//             const userData = jwt.verify(token, jwtSecret);
//             const user = await User.findById(userData.userId);
//             res.json(user);
//         } catch (err) {
//             console.error(err);
//             res.status(401).json('Invalid or expired token');
//         }
//     } else {
//         res.status(401).json('no token');
//     }
// });

  app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) {
                // If token verification fails, send a 401 Unauthorized response
                return res.status(401).json('Invalid or expired token');
            }
            // Check if the user associated with the token exists in the database
            User.findById(userData.userId, (err, user) => {
                if (err || !user) {
                    // If user doesn't exist, clear the session/token and send a 401 response
                    res.clearCookie('token').status(401).json('User not found');
                } else {
                    // If user exists, serve the protected content
                    res.json(userData);
                }
            });
        });
    } else {
        // If no token is present in the request, send a 401 Unauthorized response
        res.status(401).json('No token provided');
    }
});



  app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    if (!username || !password) {
      return res.status(400).json('username and password are required');
    }
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
      else {
        res.status(401).json('wrong password');
      }
    } else {
      res.status(404).json('user not found');
    }
  });

  app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    if (!username || !password) {
      return res.status(400).json('username and password are required');
    }
    try{
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
        username :username,
        password:hashedPassword,
      });
        jwt.sign({userId:createdUser._id,username}, jwtSecret, {},(err, token) => {
        if (err) throw err;
        // res.cookie('token', token,{sameSite:'none', secure:true}).status(201).json({
        //     id: createdUser._id,
        //   });
        res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
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
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    const wss = new ws.WebSocketServer({server});
    wss.on('connection', (connection, req) => {

      function notifyAboutOnlinePeople() {
        [...wss.clients].forEach(client => {
          client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
          }));
        });
      }
    
      
      const cookies = req.headers.cookie;
      if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if (tokenCookieString) {
          const token = tokenCookieString.split('=')[1];
          if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
              if (err) throw err;
              const {userId, username} = userData;
              connection.userId = userId;
              connection.username = username;
            });
          }
        }
      }
    
      connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());
        const {recipient, text} = messageData;
        if (recipient && (text || file)) {
          const messageDoc = await Message.create({
            sender:connection.userId,
            recipient,
            text,
          });
          console.log('created message');
          [...wss.clients]
            .filter(c => c.userId === recipient)
            .forEach(c => c.send(JSON.stringify({
              text,
              sender:connection.userId,
              recipient,
              _id:messageDoc._id,
            })));
        }
      });
      notifyAboutOnlinePeople();
    });

    //a5p51iFeF9UbVTZ2 