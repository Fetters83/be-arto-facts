const express   = require('express')
const app = express();


app.use(express.json())
const cors = require('cors');
app.use(cors());


const apiRouter = require('./routes/api-router')

app.use('/api',apiRouter)

//Error handling middleware

app.use((error,req,res,next)=>{
  

if(error.status && error.message){
   

     res.status(error.status).send({message:error.message})
    }
    next(error)
})

app.all('*',(req,res,next)=>{
    res.status(404).send({messsage:'endpoint not found'})
})

module.exports = app