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
const EXT_IP = process.env.EXT_IP
const APP_HOME = process.env.APP_HOME
const ENABLE_SSL = process.env.ENABLE_SSL
const API_HOST = (ENABLE_SSL=='true' ? 'https://' : 'http://')+EXT_IP+':'+PORT+'/'
const PREDICTOR_FILE = process.env.PREDICTOR_FILE
const DB_NAME = process.env.DB_NAME;

const publicDir = path.join(APP_HOME, 'public');
const uploadDir = path.join(publicDir, 'upload');

const { spawn } = require('child_process');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(DB_NAME);
const db = low(adapter);
initdb();

const logger = require('log-timestamp')(function () { return "["+new Date().toLocaleString('en-US', {timeZone:'Asia/Taipei'})+'] %s'});

const app = express();
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(expressFileUpload({
  createParentPath: true
}));

function initdb() {
  db.defaults({}).write()
}

function setLastImage(fn) {
  db.set('LastImage', fn)
    .write()
}

function processImage(res, uid) {
  try {
    const fn = APP_HOME+'public/upload/'+uid;
    console.log("processImage:"+fn);
    const process = spawn('sh', [APP_HOME+'sh/imageEffect.sh', PREDICTOR_FILE, fn]);
    let bufs='';
    let errs='';
    let type='0';
    process.stdout.on('data', (data) => {
      bufs = bufs + Buffer.from(data).toString();
      //res.send('async add effect:'+uid);
      //res.json({"file": 'result/'+uid+'/after.jpg',
      //          "res": buf
      //        });
      console.log('stdout:'+data);
    })
    process.stderr.on('data', (data) => {
      errs = errs + Buffer.from(data).toString();
      //return res.send('error');
      console.log('stderr:'+data);
    })
    process.on('exit', (data) => {
      console.log('exit:'+data);
      if (bufs.indexOf('Face not found')>-1 || bufs.indexOf('Face too small')>-1) {
        type = "-1";
      }
      else {
        type = bufs.split("\n")[1].substring(5)
      }
      if (errs != "") {
        return res.json({"uid":uid, "type":type, "after":API_HOST+'result/'+uid+'/after.jpg', "printing":API_HOST+'result/'+uid+'/printing.jpg', "fb":API_HOST+'result/'+uid+'/fb.jpg', "cover":API_HOST+'result/'+uid+'/cover.jpg', "call":API_HOST+'setLastImage/result/'+uid+'/after.jpg', "res":errs});
      }
      if (bufs != "") {
        return res.json({"uid":uid, "type":type, "after":API_HOST+'result/'+uid+'/after.jpg', "printing":API_HOST+'result/'+uid+'/printing.jpg', "fb":API_HOST+'result/'+uid+'/fb.jpg', "cover":API_HOST+'result/'+uid+'/cover.jpg', "call":API_HOST+'setLastImage/result/'+uid+'/after.jpg', "res":bufs});
      }
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
  if (!req.files||!req.files.filename) {
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

app.get('/setLastImage/result/:uid/after.jpg', (req, res) => {
  const uid = req.params.uid;
  setLastImage(uid);
  res.send('last image uid is '+uid);
})

app.get('/lastImage/', (req, res) => {
  const uid = db.get('LastImage').value();
  res.json({"file":API_HOST+'result/'+uid+'/cover.jpg'});
})

app.get('/detect/', (req, res) => {
  const d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const uid = uuid();
  res.send('Success:'+d+', uuid:'+uid);
  console.log('Success:'+d+', uuid:'+uid);
})

http.createServer(app).listen(PORT);
console.log('Starting ISOBAR Vision Server:'+PORT+'\n\n');

