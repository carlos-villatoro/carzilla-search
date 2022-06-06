const express = require('express')
const router = express.Router()
const axios = require('axios')
const db = require('../models')

const app = express()
app.set('view engine', 'ejs')

router.get('/makes', (req,res)=>{
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/motorcycle?format=json`)
    .then(response =>{
      // console.log(response.data.Results)
      res.render('motorcycles/moto.ejs', {makes: response.data.Results})
    })
})

router.get('/makes/:make', (req,res)=>{
    console.log(req.params.make)
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${req.params.make}/vehicleType/motorcycle?format=json`)
    .then(response =>{
      // console.log(response.data.Results)
      res.render('motorcycles/make.ejs', {make: req.params.name,models: response.data.Results})
    })
})

router.get('/makes/:make/:model', async (req,res)=>{
    // console.log(req.params.make)
    // console.log(req.params.model)
    const allVehicles = await db.vehicles.findOne({
      where:{
        make: req.params.make,
        model: req.params.model
      }
    })
    const allComments = await db.comment.findAll({
      where:{
        vehicleId:allVehicles.id
      }
    })
    // console.log('this is showing', allVehicles)
    // console.log('this is a comment for the above vehicle', allComments)
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${req.params.make}?format=json`)
    .then(response =>{
      // console.log(response.data.Results)
      res.render('motorcycles/models.ejs', {make: req.params.make,model: req.params.model,comments:allComments})
    })
})



module.exports = router