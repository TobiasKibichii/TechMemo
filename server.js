require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3500;
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const corsOptions = require('./config/corsOPtions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');


console.log(process.env.NODE_ENV);

connectDB();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use('/', express.static(path.join(__dirname, '/public')));

app.use('/',require('./routes/root'));

app.use('/users', require('./routes/userRoutes'));

app.all('*', (req,res) =>{ 
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname,'views','404.html'));
    }else if (req.accepts('json')){
        res.json({message: '404 Not Found'});
    }else{
        res.type(txt).send('404 Not Found');
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () =>{
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}`));
})

mongoose.connection.on('error', err =>{
    console.log(err)
    logEvents(`${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

