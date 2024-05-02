const express = require('express');
const routes = require('./index.js');
const app = express();
app.listen(5000,()=>{
    console.log('server running on 5000');
});
app.use('/sales',routes);
