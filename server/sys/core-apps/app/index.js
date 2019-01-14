// express
const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const p = path.join(__dirname, '../../admin assets/app/')
const appConfig = require(path.join(__dirname, '../../admin assets/app/config.json'))
const tempJSON = require(path.join(__dirname, '../../admin assets/app/temp.json'))
const dbAgent = require('./db-agent')

// app agent
const appAgent = require('./app-agent')
const app = new appAgent

// user agent
const userAgent = require('./user-agent')

router.get('/app', (req,res) => {
    const query = req.query.content
    if (app.appConfig.adminIsSet == app.appConfig.isSet){
        // get protected routes list
        if(app.protectedPublicRoutes.indexOf(query) == -1){
            res.status(200).json({
                status: true,
                action: null,
                data: ''
            })
        }else{
            // general public page, but requires member auth
            res.status(200).json({
                status: false,
                action: 'promt-auth'
            })
        }
    }else{
        res.status(200).json({
            status: false,
            action: null,
            data: null
        })
    }
})

router.post('/applogin', (req, res) => {
    dbAgent.readFrom(dbAgent.mainDb(), tempJSON)
        .then(data => {
            if (data.username === req.body.username && data.password === req.body.password) {
                res.status(200).json({
                    status: true,
                    token: 'asjdhkfjhdsklfh82734'
                })
            } else {
                res.status(200).json({
                    status: false
                })
            }
        })
        .catch(err => {
            res.status(200).json({
                status: false,
                err: err
            })
        })
})

router.post('/initapp', function incoming(req, res) {

    /** Checklist
     *      a. validate req.body
     *      b. confirm validation
     *      c. create db
     */


    // a. 
    const siteTitle =
        appAgent
            .staticMethods('mass-validate', req.body.siteTitle)
            .hasSpecialCharacters(false)
            .hasWhiteSpace(false)
            .required()
            .isTrue(req.body.siteTitle.length > 2)
            .done()

    const username =
        appAgent
            .staticMethods('mass-validate', req.body.username)
            .hasSpecialCharacters(false)
            .hasWhiteSpace(false)
            .required()
            .isTrue(req.body.username.length > 6)
            .done()

    const password = 
        appAgent
            .staticMethods('mass-validate', req.body.password)
            .hasSpecialCharacters()
            .isTrue(req.body.password.length > 6)
            .required()
            .done()

    const email = 
        appAgent
            .staticMethods('mass-validate', req.body.email)
            .required()
            .done()

    // b.
    const v = [
        siteTitle,
        username,
        password,
        password == req.body.repassword,
        email
    ]

    if (v.every(items => items != true)) {
        res.status(500).json(false)
    } else if (app.appConfig.adminIsSet != app.appConfig.isSet) {
    // c.
        req.body.autToken = appAgent.staticMethods('utils').generateRandomAlphabet(100, 'mix')
        req.body.uId = appAgent.staticMethods('utils').generateRandomAlphabet(20, 'mix')
        req.body.sessionId = appAgent.staticMethods('utils').generateRandomAlphabet(15, 'mix')
        req.body.tokenExpyrDate = undefined
        req.body.admins = []
        // req.body.password = appAgent.staticMethods('utils').hash(req.body.password)


        dbAgent
            .createDb('JSON', 'temp', req.body)
            .then(data => {
                res.status(200).json(true)
            })
            .catch(err => {
                res.status(500).json(false)
            })
    }
})

router.post('/dq', function incoming(req, res) {
    console.log('fisrt?')

    //
    // const config = app.appConfig

    // //
    // if (config.isSet && req.body.componentName == config.landing) {
    //     // get app's current admin
    //     // return admin object
    //     console.log(config.isSet)

    //     console.log('yes')
    // } else {
    //     console.log('no')
    //     res.status(200).json(false)
    // }

    if (true) {
        res.status(200).json(true)
    } else {
        res.status(200).json(false)
    }
})


module.exports = {
    path: '/dqapp',
    handler: router
}