const express = require('express')
const app = express()
const rowdy = require('rowdy-logger')

// middleware
const rowdyRes = rowdy.begin(app)
app.use(require('morgan')('tiny'))
app.set('view engine', 'ejs')
app.use(require('express-ejs-layouts'))
app.use(express.urlencoded({ extended: false }))

// routes
app.get('/', (req, res) => {
  res.render('index')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('server started!');
  rowdyRes.print()
})