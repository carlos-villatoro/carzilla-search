const express = require('express')
const router = express.Router()
const axios = require('axios')
const db = require('../models')

const app = express()
app.set('view engine', 'ejs')

// show faves on faves page
router.get('/faves', async (req, res)=>{ // vehicles router
    if (!res.locals.user){
        res.render('users/login.ejs', {msg: 'please log in to continue'})
        return
    }
    const allFaves = await db.vehicles.findAll({ // needs to go to vehicles router
        where: {
            userId: res.locals.user.id
        },
        include: [db.comment]
    })
    const allComments = await db.comment.findAll({
        where:{
            userId: res.locals.user.id
        }
    })
    res.render('./faves', {
        faves:allFaves, 
        user: res.locals.user,
        comments:allComments
    })
})

// add a car to faves
router.post('/faves', async(req, res)=>{ // vehicles router
    try{
        // const url = window.location.search
        console.log(req.body)
        if(res.locals.user){
        const [vehicle, created] = await db.vehicles.findOrCreate({
            where: {
                make: req.body.make,
                model: req.body.model,
                userId: res.locals.user.id,
                url: req.body.url
            }
        })
        res.redirect('/vehicles/faves')
        }
        else if(!res.locals.user){
        res.render('users/login.ejs', {msg: 'please log in to continue'})
        return
        }
    }  catch (err){
        console.warn(err)
    }
})

router.post('/delete', async(req, res)=>{ //vehicles router
    try {
        console.log(req.body)
        if(res.locals.user){
        //    const findUser = await db.user.findAll({
        //        where: {
        //            id: res.locals.user.id
        //        }, 
        //        include: [db.vehicles]
        //    }) 
          const deleteInst = await db.vehicles.destroy({
               where : {
                make: req.body.make,
                model: req.body.model,
                userId: res.locals.user.id
               }, 
            //    include: [db.vehicles]
           })
        //    console.log(findUser[0].vehicles)
        res.redirect('/vehicles/faves')
        }
    } catch (err) {
        console.warn(err)
    }
})

router.post('/delete/comment', async(req,res)=>{ //vehicles router
    try {
        console.log(req.body.content)
        if(res.locals.user){
            deleteCom = await db.comment.destroy({
                where:{
                    userId: res.locals.user.id,
                    content: req.body.content
                }
            })
            res.redirect('/vehicles/faves')
        }
    } catch (error) {
        console.warn(error)
    }
})

router.post('/newComment', async(req, res)=>{ //vehicles router
    try {
        const findVehicle = await db.vehicles.findOne({ // use form data
                where:{
                    make: req.body.make,
                    model: req.body.model
                }
            })
        if(res.locals.user){
            console.log(req.body)
            
            console.log(`url:${findVehicle.url}, content:${req.body.content}, email: ${res.locals.user.email}, vehicleId:${findVehicle.id}, userId:${findVehicle.userId}`) //all the info for comment table  
            const [comment, created] = await db.comment.findOrCreate({
                where:{
                    userId:findVehicle.userId,
                    vehicleId:findVehicle.id,
                    email:res.locals.user.email,
                    content:req.body.content,
                    url:findVehicle.url
                }
            })
        }
        res.redirect(`${findVehicle.url}`)
        

    } catch (err) {
        console.warn(err)
    }
})

module.exports = router