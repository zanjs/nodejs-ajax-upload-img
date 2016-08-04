
var express = require('express')
  , morgan = require('morgan')
  , fs = require('fs')
  , path = require('path')
  , multipart = require('connect-multiparty');

var app = express();
app.use(express.static('./public'));
app.use(morgan('dev'));


function MKDirIfNotExist(filePN){
    var dirArr = filePN.split('/'), cPath = '';

    for(var i = 0, len = dirArr.length; i < len; i ++){
        if(dirArr[i]) {
          cPath += dirArr[i];
          var exists = fs.existsSync(cPath);
          if(!exists){
            fs.mkdirSync(cPath);
          } 
          cPath += '/';
        }
    }
}

app.listen(process.env.PORT || 3000);
console.log('Node.js running at: http://0.0.0.0:3000');

app.post('/upload', multipart(), function(req, res){
  //get filename
  var filename = req.files.files.originalFilename || path.basename(req.files.files.ws.path);
  //copy file to a public directory
  
  var todayDate = new Date();
  var date = todayDate.getDate();
  var month= todayDate.getMonth() +1;
  var year= 1900+todayDate.getYear();
  var mkPath = '/file/'+year+ month+'/';
  var dPath = '/public/'+mkPath;
  getAllFiles(path.dirname(__filename)+'/public/file/',function(fi){
    console.log(fi)
  })

  console.log(dPath)
  MKDirIfNotExist(path.dirname(__filename) + dPath)
  var targetPath = path.dirname(__filename) + dPath + filename;
  //copy file
  fs.createReadStream(req.files.files.ws.path).pipe(fs.createWriteStream(targetPath));
  //return file url
  res.json({code: 200, msg: {url: 'http://' + req.headers.host + mkPath + filename}});
});

app.get('/env', function(req, res){
  console.log("process.env.VCAP_SERVICES: ", process.env.VCAP_SERVICES);
  console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL);
  console.log("process.env.VCAP_APPLICATION: ", process.env.VCAP_APPLICATION);
  res.json({
    code: 200
    , msg: {
      VCAP_SERVICES: process.env.VCAP_SERVICES
      , DATABASE_URL: process.env.DATABASE_URL
    }
  });
});

/**
 * 获取文件夹下面的所有的文件(包括子文件夹)
 * @param {String} dir
 * @param {Function} callback
 * @returns {Array}
 */
 function getAllFiles(dir, callback) {
  var filesArr = [];
  dir = ///$/.test(dir) ? dir : dir + '/';
  (function dir(dirpath, fn) {
    var files = fs.readdirSync(dirpath);
    async(files, function (item, next) {
      var info = fs.statSync(dirpath + item);
      if (info.isDirectory()) {
        dir(dirpath + item + '/', function () {
          next();
        });
      } else {
        filesArr.push(dirpath + item);
        callback && callback(dirpath + item);
        next();
      }
    }, function (err) {
      !err && fn && fn();
    });
  })(dir);
  return filesArr;
}

/**
 * 控制流/同步
 * @param {Array} arr
 * @param {Function} callback1 传递两个参数 (item,next)，执行完一项则需执行next()才能执行下一项
 * @param {Function} callback2 出错或执行完时回调
 * @returns {*}
 */
function async (arr, callback1, callback2) {
    if (Object.prototype.toString.call(arr) !== '[object Array]') {
        return callback2(new Error('第一个参数必须为数组'));
    }
    if (arr.length === 0)
        return callback2(null);
    (function walk(i) {
        if (i >= arr.length) {
            return callback2(null);
        }
        callback1(arr[i], function () {
            walk(++i);
        });
    })(0);
}