let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let mongoose = require('mongoose');
let multer = require('multer');
// let crypto = require('crypto');


let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now()+getRandomName	(file.originalname))
  }
})
 
let upload = multer({storage:storage});
// let upload = multer();
// const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');
var AWS = require('aws-sdk');


let app = express();
app.use(express.static(path.join(__dirname,'public')));
app.use(require('cors')());

mongoose.connect('mongodb://localhost:27017/myuploaddb',{useNewUrlParser:true});
mongoose.set('debug','true');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

/* app.post('/upload',upload.single('avatar'), function(req, res, next) {
	if(!req.file){
		console.log("No file");
	} else {
		console.log(req.file);
	}
});
 */
//s3 configurations

var bucket = "s3-blog-bucket";
var s3Client = new AWS.S3({
  accessKeyId: "AKIAIIHNMLU3IUNCY5OQ",
  secretAccessKey: "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"
});


app.post('/upload', upload.single('avatar'), (req, res) => {
	// console.log(req.body);
	if (!req.file) {
	//   console.log("No file received");
	  return res.send({success: false});
  
	} else {

		// randomName = getRandomName(req.file.originalname);
		//insert into s3 bucket.
	s3Client.putObject({
        Bucket: bucket,
				Key: req.file.filename,
        ACL: 'public-read',
        Body: fs.readFileSync(req.file.path),
				ContentLength: req.file.size,
				ContentType: req.file.mimetype,
      }, function(err, data) {
        if (err) { return res.json({'error':'error while '})}
        // console.log("https://s3.amazonaws.com/" + bucket + '/' + randomName);
        return res.send({success: true})
});
	  
	  
	}
  });
 
   function getRandomName(originalName) {
	return crypto.randomBytes(16).toString('hex') + path.extname(originalName);
  }
   

app.listen(process.env.PORT || 8000);

