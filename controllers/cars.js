const express = require('express')
const router = express.Router()
const axios = require('axios')

const app = express()
app.set('view engine', 'ejs')

router.get('/makes', (req,res)=>{
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`)
    .then(response =>{
      console.log(response.data.Results)
      res.render('cars/cars.ejs', {makes: response.data.Results})
    })
})

router.get('/makes/:name', (req,res)=>{
    // console.log(req.params.name)
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${req.params.name}?format=json`)
    .then(response =>{
      console.log(response.data.Results)
      res.render('cars/make.ejs', {name: req.params.name,models: response.data.Results})
    })
})



module.exports = router