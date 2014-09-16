var CONFIG = require("../config");
var fs = require("fs-extra");
var path = require('path');
var async = require('async');
var request = require('request');   // npm install request
var Generate2Xml = require("./XmlGenerator.js");
var OrderHelper = require("./OrderHelper.js");

exports.execute = function (pathStack, cb) {
  checkEnvironment(pathStack,function (err) {
    if (!err) {
      processAStack(pathStack, cb);
    } else {
      cb();
    }
  })
}


function checkEnvironment(pathStack, cb) {
  fs.lstat(pathStack, function (err) {
    if (err) {
      console.log(err);
      cb(err);
    } else {
      cb();
    }
  });
};

function processAStack(pathStack, cb) {
  var stackID = path.basename(pathStack);

  var orderXML = new Generate2Xml(OrderHelper.createOrderID, stackID, OrderHelper.createProcessID, OrderHelper.createDocumentID).generateXML();
  fs.writeFileSync(pathStack + '/order.xml' , orderXML);
  var params = {
    "orderarchive-only" : true,
    "order" : orderXML,
    "response-format" : "json"
  }
  request(
    {
      method: 'POST',
      url: CONFIG.WEBSERVICE_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "charset" : "utf-8"
      },
      form  : params
    }
    , function (error, response, body) {
      cb();
    }
  )
}