const express = require('express')
const route = require('./routes/route')

const app = express()
const mongoose = require('mongoose')

app.use(express.json())

mongoose.connect("mongodb+srv://sumit:sumit@cluster0.8dflsuw.mongodb.net/ATG",{useNewUrlParser:true})
    .then(() => {
        console.log("MongoDb is connected")
    }).catch((err) => { console.log(err.message) })

app.use('/', route)

port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Server is running on port: " + port)
})