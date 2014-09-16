// --- Generate ID ---------------

var os=require('os');
var crypto = require('crypto');
var XML_TYPE_ID = "1012";
var PDF_TYPE_ID = "0008";

// --- CREATE ORDER ID
exports.createOrderID = createOrderID;
function createOrderID(){
  var OrderId = "";
  OrderId = DatetoString() + IDType(XML_TYPE_ID) + MD5() + IP() + Random();
  return OrderId;

}

// ---- CREATE PROCESS ID
exports.createProcessID = createProcessID;
function createProcessID(){
  var ProcessId = "";
  ProcessId = DatetoString() + IP() + Random();
  return ProcessId;
}


// ---- CREATE DOCUMENT ID
exports.createDocumentID = createDocumentID;
function createDocumentID(){
  var DocumentId = "";
  DocumentId = DatetoString() + IDType(PDF_TYPE_ID) + MD5() + IP() + Random();
  return DocumentId;
}


function DatetoString(){

  var date = new Date();
  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  var minisecond = date.getMilliseconds();

  var StringTime = year + month + day + hour + min + sec + minisecond;
//  var dateint = date.getMilliseconds() +""+ date.getSeconds() + date.getMinutes() + date.getHours() + date.getDate() +date.getMonth() + date.getFullYear() + Math.floor((Math.random()*1000));
  if(StringTime.length <17){
    StringTime = StringTime + "0";
  }
  return StringTime;
}

function IDType(OrderXML){
  return OrderXML;
}


function MD5(){

  var str = DatetoString();
  var hash = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  return hash;

}


function IP(){
  var ifaces=os.networkInterfaces();
  var address = new ArrayBuffer(4);
  var IP="", kk;
  for (var dev in ifaces) {
    var alias=0;
    ifaces[dev].forEach(function(details){
      if (details.family=='IPv4' && details.address != "127.0.0.1") {
        address = details.address.split(".");
        kk = ((0xff000000 & (address[0] << 24)) + (0x00ff0000 & (address[1] << 16)) + (0x0000ff00 & (address[2] << 8)) + (0x000000ff & (address[3])));
        IP = kk.toString(16);
      }
    });
  }
  return(IP.replace("-","").toUpperCase());
}


function Random(){
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 10; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function toHex(d) {
  var r = d % 16;
  if(d-r==0) {return toChar(r);}
  else {return toHex( (d-r)/16 )+toChar(r);}
}

function toChar(n) {
  var alpha = "0123456789ABCDEF";
  return alpha.charAt(n);
}
