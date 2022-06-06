const express = require('express')
const router = express.Router()
const axios = require('axios')
const db = require('../models')

const app = express()
app.set('view engine', 'ejs')

router.get('/makes', (req,res)=>{
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`)
    .then(response =>{
      console.log(response.data.Results)
      res.render('cars/cars.ejs', {makes: response.data.Results})
    })
})


router.get('/makes/:make', (req,res)=>{
    // console.log(req.params.make)
    axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${req.params.make}/vehicleType/car?format=json`)
    .then(response =>{
      console.log(response.data.Results)
      res.render('cars/make.ejs', {make: req.params.name,models: response.data.Results})
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
    // console.log(allVehicles)
    // console.log('this is showing', allVehicles)
    // console.log('this is a comment for the above vehicle', allComments)
    if(allVehicles){
      const allComments = await db.comment.findAll({
        where:{
          url: allVehicles.url
        }
      }) 
      // console.log(allComments)
      axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${req.params.make}?format=json`)
        .then(response =>{
          res.render('cars/models.ejs', {make: req.params.make,model: req.params.model,comments:allComments, vehicles:allVehicles})
          // console.log(res)
        })
        } else {
          axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${req.params.make}?format=json`)
            .then(response =>{
              res.render('cars/models.ejs', {make: req.params.make,model: req.params.model, comments:null})
      })
    }
})


module.exports = router