var fs = require("fs-extra");
var phantom = require('phantom');
var MailParser = require("mailparser").MailParser;
var jade = require('jade');
var ExtendFunc = require("../include/Helper.js");
var CONFIG = require("../config");
var ImportOrders = require("../include/OrderImporter.js");

// --- default
var fileName = "";



exports.process = function(req, res){

  if(CONFIG.PDF_ONLY){
    res.setHeader('Content-disposition', 'attachment; filename=' + req.files.eml.name.replace(".eml",".pdf"));
  }
  var tempId = 'basic1';  // Default Template ID

  var ObjectJS = {};  //--- Default object to change effect
  ObjectJS.textstyle = 'normal';
  ObjectJS.colortexthead = '000000';
  ObjectJS.colorboderhead = '000000';
  ObjectJS.colorboderbody = '000000';

  //== WHEN USER APPLY EFECT
  if(req.body.textstyleSelect_input || req.body.TextHeadColor || req.body.BoderHeadColor || req.body.BoderBodyColor){
    var newObjectJS = ObjectJS;
    newObjectJS.textstyle = req.body.textstyleSelect_input;
    newObjectJS.colortexthead = '#'+req.body.TextHeadColor;
    newObjectJS.colorboderhead = '#'+req.body.BoderHeadColor;
    newObjectJS.colorboderbody = '#'+req.body.BoderBodyColor;
    var resultEml = creatJadeEmlObject(req.session.oEml);
    res.render('HTMLTEMPLATES/'+req.session.tempId,{eml : resultEml, ObjectJS: newObjectJS});
  }

  else{

    //== WHEN USER CHANGE TEMPLATE
    if(req.session.oEml && req.body.tempId){ //=== Use change template
      req.session.tempId = req.body.tempId;
      var resultEml2 = creatJadeEmlObject(req.session.oEml);
      res.render('HTMLTEMPLATES/'+req.body.tempId,{eml : resultEml2, ObjectJS: ObjectJS});
    }
    else{

      //== WHEN USER UPLOAD FILE EML TO CONVERT
      if(req.files.eml.name){
        var path = req.files.eml.path;
        tempId = req.body.tempName;
        req.session.fileName = req.files.eml.name;
        fileName = req.files.eml.name.replace(".eml",".pdf");
        fs.readFile(path, function(err, emlFileContent){
          if(!err){
            req.session.tempId = tempId;
            parseEml(emlFileContent, function(emlObject){
              if(emlObject.html || emlObject.from){
                req.session.oEml = emlObject;
                var resultEml = creatJadeEmlObject(emlObject);

                for (var index in resultEml.attachments){
                  req.session[resultEml.attachments[index].name] = new Buffer(emlObject.attachments[index].content, 'base64');
                  console.log('in for: index: '+index);
                  console.log(resultEml.attachments[index].name);
                }
                if(!CONFIG.PDF_ONLY){
                  res.render('HTMLTEMPLATES/'+tempId,{eml : resultEml, ObjectJS: ObjectJS});
                }

                saveAndImportOrder(req, res, tempId, emlObject, ObjectJS);
              } else{
                res.send("can't parse this file: "+ req.files.eml.name + ("_____PLEASE GO BACK!"));
              }

            });
          }
          else{
            res.send('File Not found !');
          }
        });
      }
      else{
        res.send('Empty file name ?!');
      }
    }
  }
};

//=== CREAT EML OBJECT FROM EMLOBJECT_PARTCER
exports.creatEmlObject = creatJadeEmlObject;
function creatJadeEmlObject(oEml){
  try {
    // ==== REPLACE IMAGE CONTENT ====
    var resultEml={};
    var dictImg = {};
    var arrAtt = [];
    var htmlContent = "";
    try {
      htmlContent = oEml.html;
    }
    catch(exception){
      try {
        htmlContent += oEml.comments;
      }
      catch(exep){
        console.log("html is emtry");
      }
    }

    if (oEml.attachments != undefined) {  // hash dictionary
      var j = 0;
      for (var i = 0; i < oEml.attachments.length; i++) {
        var dictAtt = {};
        if(oEml.attachments[i].contentDisposition != 'LOL'){ // attachments is INLINE (images,..)
          var key = "cid:" + oEml.attachments[i].contentId;
          var templ = new Buffer(oEml.attachments[i].content, 'binary').toString('base64');
          var value = "data:" + oEml.attachments[i].contentType + ";base64," + templ;
          dictImg[key] = value;
//        }
//        else{ // attachments is file
          dictAtt.name = oEml.attachments[i].fileName;
//          req.session[dictAtt.name] = new Buffer(oEml.attachments[i].content, 'base64');
          arrAtt[j] = dictAtt;
          j++;
        }
      }

      resultEml['attachments'] = arrAtt;
      // Loop through all images in EML
      for (var keys in dictImg) {
        htmlContent = htmlContent.replace(keys, dictImg[keys]);
      }
    }
    // ==== UTF8 ENCODE ====
    try{
      htmlContent = htmlContent.replace('<html>', '<html>' + '\n' + '<meta http-equiv="Content-type" content="text/html; charset=utf-8" />');
    }
    catch(abc){
      console.log("can't replace html");
    }

    // ==== RENDER HTML ====

    resultEml['html']=htmlContent;
    resultEml['from']=oEml.from[0].address;
    var to = '';
    var cc = '';
    try{
      for(var i=0; i<oEml.to.length; i++){
        to = to + oEml.to[i].name + '  ' + oEml.to[i].address + '; ';
      }
      for(var j=0; j<oEml.cc.length; j++){
        cc = cc + oEml.cc[j].name + '  ' + oEml.cc[i].address + '; '
      }
    }
    catch(abc){

    }
    resultEml['to']=to;
    resultEml['cc']=cc;
    resultEml['subject']=oEml.subject;
    resultEml['time']=oEml.headers['date'];
    resultEml['bodyContent']=htmlContent;
  }
  catch (exep) {
    console.log("Can't display email to html");
  }
  return resultEml;
};

//=== PARSE EML OBJECT FROM DATA OF EML FILE.
function parseEml(emlFileContent, callback){
  var mailParser = new MailParser();

  mailParser.write(emlFileContent);
  mailParser.once("end", function(oEml){
      callback(oEml);
  });
  mailParser.end();
}

//=== CREATE STACK FOLDER, PDF FROM EML_FILE
function saveAndImportOrder(req, res, tempId, oEml, ObjectJS){  //--- req and res use to save variables, render html using phantom
  var countfile = 1;

  var folderName = ExtendFunc.createFolderName(countfile, CONFIG.IMPORT_DIR, countfile);
  var pathFilePdf = CONFIG.IMPORT_DIR + '/' + folderName + '/' + fileName;
  req.session.pathFDF = pathFilePdf;
  var resultEml = creatJadeEmlObject(oEml);
  var date = new Date();
  var pathFileHtml = './public/html/'+date.toDateString()+'_'+date.getHours()+'_'+date.getMinutes()+'_'+date.getSeconds()+'_'+date.getMilliseconds()+'_EmailArchiver.html';
  var pathFileHtmlGet = pathFileHtml.replace("./public","");

  //--- get HTML content of jade pdf
  res.render('HTMLTEMPLATES/'+tempId, {eml : resultEml, ObjectJS: ObjectJS, eml2: resultEml}, function(err, body){
    var freeport = Math.floor((Math.random()*10000)+1);
    phantom.create({'port': freeport},function(ph){
      ph.createPage(function(page){

        // CONFIG PDF PAGE
        page.set('viewportSize', { width: 1600});
        page.set('paperSize', {format: 'A4'});
        page.set('zoomFactor', 1);

        // WRITE EMML TO HTML
        fs.writeFileSync(pathFileHtml, body);

        // RENDER PDF
        page.open('http://localhost:3300/'+pathFileHtmlGet, function (status) {
          page.render(pathFilePdf, function(){
            req.session.pathFDF = pathFilePdf;
            ph.exit();

            //return PDF file
            if(CONFIG.PDF_ONLY){
              fs.readFile(pathFilePdf, function(err, data){
                if(!err){
                  res.write(data);
                  res.end();
                }
                else{
                  console.log('in err read file: '+err);
                }
              });
            }

            fs.unlinkSync(pathFileHtml);//--- remove html file
              if(CONFIG.IS_SERVER){
                ImportOrders.execute(CONFIG.IMPORT_DIR + '/' + folderName,function(){
                });
              }
          });
        });
      });
    });
  });
}
