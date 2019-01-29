/**
 * Copyright 2018 isobar. All Rights Reserved.
 *
 */

'use strict';

const dotenv = require('dotenv').config();
const express = require('express');
const expressFileUpload = require('express-fileupload');
const http = require('http');
const uuid = require('uuid/v1');
const formData = require('form-data');
const fs = require('fs');
const path = require('path');

const HOST = process.env.HOST
const PORT = (process.env.PORT || 8888)
const APP_HOME = process.env.APP_HOME
const API_HOST = process.env.API_HOST
const PREDICTOR_FILE = process.env.PREDICTOR_FILE

const publicDir = path.join(APP_HOME, 'public');
const uploadDir = path.join(publicDir, 'upload');

const { spawn } = require('child_process');

const app = express();
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(expressFileUpload({
  createParentPath: true
}));

function processImage(res, uid) {
  try {
    const fn = APP_HOME+'public/upload/'+uid;
    console.log("processImage:"+fn);
    const process = spawn('sh', [APP_HOME+'sh/imageEffect.sh', PREDICTOR_FILE, fn]);
    process.stdout.on('data', (data) => {
      //res.send('async add effect:'+uid);
      let str = Buffer.from(data).toString();
      res.json({"file": 'result/'+uid+'/after.jpg',
                "res": str
              });
      console.log('stdout:'+data);
    })
    process.stderr.on('data', (data) => {
      res.send('error');
       console.log('stderr:'+data);
    })
    process.on('exit', (data) => {
      console.log('exit:'+data);
    })
  } catch (err) {
    console.log(err);
  }
}

function processfib(res, num) {
  try {
    const process = spawn('sh', [APP_HOME+'sh/fib.sh', num]);
    process.stdout.on('data', (data) => {
      uploadImages(num);
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
  } catch (err) {
    console.log(err);
  }
}

function uploadImages(sno) {
  const form = new formData();
  form.append('filename', fs.createReadStream('public/images/tom_cruise.jpg'));
  form.submit(API_HOST+'upload/', (err, res) => {
    if (err) throw err;
    console.log(res.statusCode);
  })
}

function uploadImageWithcurl(sno) {
  console.log('>>>>>uploadImage:',sno);
  const src = 'public/images/'+sno+'/output.jpg';
  try {
    const uploader = spawn('sh', [APP_HOME+'sh/uploader.sh', HOST, sno]);
    uploader.stdout.on('data', (data) => {
      console.log('stdout:'+data);
    })
    uploader.stderr.on('data', (data) => {
      console.log('stderr:'+data);
    })
    uploader.on('close', (code) => {
      console.log('child process exited with code '+code);
    })
  } catch (err) {
    console.log(err);
  }
}

app.get('/fib/:num', (req, res) => {
  const n = req.params.num;
  processfib(res, n);
  console.log('req:'+n);
})

app.get('/uploader/', (req, res) => {
  res.render('uploader');
})

app.post('/upload/', (req, res) => {
  if (!req.files) {
    return res.status(400).send("No file was uploaded");
  }
  let file = req.files.filename;
  // let filename = req.files.filename.name.replace(/[\/\?<>\\:\*\|":]/g, '').toLowerCase();
  // file.mv('public/upload/'+filename, (err) => {
  const uid = uuid();
  let uploadPath = path.join(uploadDir, uid);
  console.log(uploadPath);
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    processImage(res, uid);
    // res.send('upload success');
  })
})

app.get('/detect/', (req, res) => {
  const d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const uid = uuid();
  res.send('Success:'+d+', uuid:'+uid);
  console.log('Success:'+d+', uuid:'+uid);
})

http.createServer(app).listen(PORT);
console.log('Starting ISOBAR Vision Server:'+PORT+'\n\n');

