
//=== Response data of Attachments when use want download them! ===

exports.attachmentDownload = function(req, res){

  var data;
  if(req.body.attName){
    try{
      console.log('in attachmentDownload: '+req.session[req.body.attName]);
      res.setHeader('Content-disposition', 'attachment; filename='+req.body.attName);
      data = new Buffer(req.session[req.body.attName], 'base64');
    }
    catch(e){
      console.log
    }
    res.write(data);
    res.end();
  }
  else{
    res.end();
  }
}