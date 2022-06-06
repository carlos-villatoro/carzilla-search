const express = require('express')
const router = express.Router()
const axios = require('axios')

const app = express()
app.set('view engine', 'ejs')

router.get('/makes', (req,res)=>{
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/truck?format=json`)
    .then(response =>{
      console.log(response.data.Results)
      res.render('trucks/trucks.ejs', {makes: response.data.Results})
    })
})

router.get('/makes/:make', (req,res)=>{
    console.log(req.params.make)
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${req.params.make}/vehicleType/truck?format=json`)
    .then(response =>{
      console.log(response.data.Results)
      res.render('trucks/make.ejs', {make: req.params.name,models: response.data.Results})
    })
})

router.get('/makes/:make/:model', (req,res)=>{
    // console.log(req.params.make)
    // console.log(req.params.model)
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${req.params.make}?format=json`)
    .then(response =>{
      console.log(response.data.Results)
      res.render('trucks/models.ejs', {make: req.params.make,model: req.params.model})
    })
})

module.exports = router