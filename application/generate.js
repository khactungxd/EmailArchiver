//Dependencies
var fs = require('fs');
var path = require('path');

//Dictionary json-schema file
var jsFilePath = process.argv[2];
var jsFileName = path.basename(jsFilePath);
if(!fs.existsSync(jsFilePath) || !jsFileName.split('.').pop() == "json"){
  console.log("File can't found or file isn't 'json-schema' !");
} else {
  var jsData = require(jsFilePath);
  var properties = jsData['properties'];
  var definitions = jsData['definitions'];
  var schema = {};
  for(var key in properties){
    schema[key] = {};
    schema[key]["model"] = getProperties(properties[key], {});
  }
  for(var key in definitions){
    schema[key] = {};
    schema[key]["model"] = getProperties(definitions[key], {});
  }
  var dataWrite = "var schema={};";
  for(var key in schema){
    dataWrite = dataWrite+gnrClass(key, schema[key]["model"]);
  }
  generateFile(dataWrite);
}

function gnrClass(className, model){
  var properties4Class = "";
  var initClass = "";
  for(var key in model)
  {
    properties4Class = properties4Class + "this['"+key+"']="+JSON.stringify(model[key])+";";
  }
  initClass = "schema."+className+ "= function(){"+ properties4Class +"};";
  return initClass;
}

function generateFile(dataWrite){
  var dataWrite = dataWrite+" module.exports = schema;";
  var data2Path = path.dirname(jsFilePath)+"/";
  try{
    fs.writeFileSync(data2Path+jsFileName.split('.').shift()+".Class.js",dataWrite);
  }catch (e){
    console.log(e);
  }finally{
    console.log("process script file "+data2Path+jsFileName.split('.').shift()+".Class.js success ... !")
  }
}

function getProperties(properties, obj){
  if(properties["properties"])
    obj = getProperties(properties["properties"], {});
  else {
    for(var key in properties){
      if(properties[key]["type"] && !properties[key]["properties"]){
        if(properties[key]["default"])
          obj[key] = properties[key]["default"];
        else if(properties[key]["enum"])
          obj[key] = properties[key]["enum"][0];
        else
          obj[key]  = nav4Type(properties[key]["type"])
      } else if(properties[key]["properties"]) {
        var newO = properties[key]["properties"];
        obj[key] = getProperties(newO , {});
      } else if(properties[key]["$ref"])
      {
        obj[key] = {};
      }
    }
  }
  return obj;
}

function nav4Type(type){
  switch (type){
    case "string" :
      return "";
    case "object" :
      return {};
    case "array" :
      return [];
    case "number" :
      return 0;
  }
}
