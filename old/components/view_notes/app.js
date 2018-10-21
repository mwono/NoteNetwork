const express = require('express');

const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const mongoURI = 'mongodb://Dingster01:CoolishMarlin6@ds251112.mlab.com:51112/mongouploads';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
  })

    // Create storage engine
    const storage = new GridFsStorage({
        url: mongoURI,
        file: (req, file) => {
          return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
              if (err) {
                return reject(err);
              }
              const filename = buf.toString('hex') + path.extname(file.originalname);
              const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
              };
              resolve(fileInfo);
            });
          });
        }
      });
    const upload = multer({ storage });


// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if(!files || files.length === 0){
            res.render('index.ejs', {files: false});
        } else {
            files.map(file => {
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/jpg'){
                    file.isImage = true;

                } else {
                    file.isImage = false;
                }
            });
            res.render('index.ejs', {files: files});
        }
    });
});

// @route GET /files
// @desc Display all files in JSON
app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if(!files || files.length === 0){
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        // Files exist
        return res.json(files);
    });

});

// @route GET /files/:filename
// @desc Display single file object
app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
    // Check if file
    if(!file || file.length === 0){
        return res.status(404).json({
            err: 'No file exists'
        });
    }
    // File exists
    return res.json(file);
    });
});


// @route GET /image/:filename
// @desc Display image
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
    // Check if file
    if(!file || file.length === 0){
        return res.status(404).json({
            err: 'No file exists'
        });
    }
    // Check if image
    if(file.contentType == 'image/jpeg' || file.contentType === 'img/png'){
       // Read output to browser 
       const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    } else {
        res.status(404).json({
            err: 'Not an image'
        })
    }
    });
});

app.post('/search', (req, res) => {

});

app.listen(8000, () => console.log('Port opened on 8000'));

module.exports = app;