/**
 * Copyright 2018 isobar. All Rights Reserved.
 *
 */

'use strict';

const dotenv = require('dotenv').config();
const express = require('express');
const expressFileUpload = require('express-fileupload');
const http = require('http');

const HOST = process.env.HOST
const PORT = (process.env.PORT || 8888)
const APP_HOME = process.env.APP_HOME

const { spawn } = require('child_process');

const app = express();
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(expressFileUpload());

function processImage(res, num) {
  const process = spawn('python', [APP_HOME+'src/fib.py', num]);
  process.stdout.on('data', (data) => {
    res.send('async fib('+num+'):'+data.toString().split(':')[1]);
    console.log('stdout:'+data);
  })
  process.stderr.on('data', (data) => {
    res.send('error');
    console.log('stderr:'+data);
  })
  process.on('exit', (data) => {
    console.log('exit:'+data);
  })
}

app.get('/fib/:num', (req, res) => {
  const n = req.params.num;
  processImage(res, n);
  console.log('req:'+n);
})

app.get('/uploader/', (req, res) => {
  res.render('uploader');
})

app.post('/upload/', (req, res) => {
  if (!req.files) {
    req.status(400).send("No file was uploaded");
  }
  let file = req.files.filename;
  let filename = req.files.filename.name.replace(/[\/\?<>\\:\*\|":]/g, '').toLowerCase();
  file.mv('public/upload/'+filename, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('upload success');
  })
})

app.get('/detect/', (req, res) => {
  const d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  res.send('Success:'+d);
  console.log('Success:'+d);
})

http.createServer(app).listen(PORT);
console.log('Starting ISOBAR Vision Server:'+PORT+'\n\n');

