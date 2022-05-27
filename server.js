// required packages
const express = require('express')
const rowdy = require('rowdy-logger')
const cookieParser = require('cookie-parser')
const db = require('./models')
const cryptojs = require('crypto-js')
require('dotenv').config()

// app config
const PORT = process.env.PORT || 3000
const app = express()
app.set('view engine', 'ejs')

// middlewares
const rowdyRes = rowdy.begin(app)
app.use(require('express-ejs-layouts'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// DIY middleware -- modifies req as it comes in and res as it goes out
app.use((req, res, next)=>{
  // handy dandy debugging req logger
  console.log(`[${new Date().toLocaleString()}] incoming request: ${req.method} ${req.url}`)
  console.log('request body:', req.body)
  // modify the response to give data to the routes/mw that is 'downstream'
  res.locals.myData = 'hi i came from a middleware'
  // tell express the middleware is done
  next()
})

// auth middleware
app.use(async (req, res, next)=>{
  try{
  // if there is a cookie 
  if(req.cookies.userId){
      // try to find that user in the db
      const userId = req.cookies.userId
      const decryptedId = cryptojs.AES.decrypt(userId, process.env.ENC_KEY).toString(cryptojs.enc.Utf8)
      const user = await db.user.findByPk(decryptedId)
      // mount the found user on the res.locals so that later routes can access the logged in user
      res.locals.user = user
    } else {
      // the user is explicitly not logged in
      res.locals.user = null
    }
    next()
    } catch (err){
      console.log(err)
    }
})

// controllers
app.use('/users', require('./controllers/users'))

// 

// routes
app.get('/', (req, res) => {
  console.log(res.locals)
  // throw new Error ('oooooopsss')
  res.render('index')
})

// 404 error handler LAST
// app.get('/*', (req, res)=>{
//   // render yopur 404 here
// })
app.use((req, res, next)=>{
  // render a 404 template
  res.status(404).render('404.ejs')
})

// 500 error
// needs to have all 4 params
app.use((error, req, res, next)=>{
  // log the error
  console.log(error)
  // send a 500 error template
  res.status(500).render('500.ejs')
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  rowdyRes.print()
})
