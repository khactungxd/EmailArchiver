var OrderSchema = require('../schemas/Order.Class.js');
var js2xmlparser = require("js2xmlparser");

//------------------------------------------------------ order ------------------------------
var MANDANT = "stag";
var PROCESS_TYPE = "administration";
var DOCUMENT_TYPE = "import_protocol";
var GENERATE2XML = function(orderId, stackId, processId, documentId, options){
  this.orderId = orderId;
  this.stackId = stackId;
  this.processId = processId;
  this.documentId = documentId;
    this.mandant = (options && options["stag"]) ? options["stag"] : MANDANT;
    this.processType = (options && options["processType"]) ? options["processType"] : PROCESS_TYPE;
    this.documentType = (options && options["documentType"]) ? options["stag"] : DOCUMENT_TYPE;
}

GENERATE2XML.prototype.generateXML = function(){
  var order = new OrderSchema.order();
  order.id = this.orderId;
  order.actionList = {};
  order.mandant = this.mandant;
  order.inputChannel = {};
  order.exportChannel = {};

//------------------------------------------------------ stack ------------------------------
  var stack = new OrderSchema.Stack();
  stack.id = this.stackId;

//------------------------------------------------------ generate2orderxml ------------------------------
  var process = new OrderSchema.Process();
  process.id = this.processId;
  process.processType = this.processType;
  process.actionList = {};
  process.processPriority = {};

//------------------------------------------------------ indexData for generate2orderxml------------------------------
  var indexDataProcess = new OrderSchema.IndexData();
  var indexFieldListProcess = new OrderSchema.IndexFieldList();

  var arrIndexFieldProcess = createArray4IndexField(4,new OrderSchema.IndexField());
  arrIndexFieldProcess[0].name = "pi_order_id_str";
  arrIndexFieldProcess[0].value = this.orderId;

  arrIndexFieldProcess[1].name = "pi_stack_id_str";
  arrIndexFieldProcess[1].value = this.stackId;

  arrIndexFieldProcess[2].name = "pi_process_id_str";
  arrIndexFieldProcess[2].value = this.processId;

  arrIndexFieldProcess[3].name = "pi_process_type_str";
  arrIndexFieldProcess[3].value = this.processType;

//------------------------------------------------------ document ------------------------------
  var document = new OrderSchema.Document();
  document.id = this.documentId;
  document.documentType = this.documentType;
  document.idType = {};
  document.actionList = {};
  document.inputType = {};

//------------------------------------------------------ indexData for document ------------------------------

  var indexDataDocument = new OrderSchema.IndexData();
  var indexFieldListDocument = new OrderSchema.IndexFieldList();

  var arrIndexFieldDocument = createArray4IndexField(5, new OrderSchema.IndexField());
  arrIndexFieldDocument[0].name = "document_id_str";
  arrIndexFieldDocument[0].value = this.documentId;

  arrIndexFieldDocument[1].name = "document_type_str";
  arrIndexFieldDocument[1].value = this.documentType;

//------------------------------------------------------ push document --> generate2orderxml ------------------------------
  process.documentList.push({document:document});

//------------------------------------------------------ push arrIndexFieldProcess --> indexFieldList ------------------------------
  indexFieldListProcess.indexField = arrIndexFieldProcess;
  indexDataProcess.indexFieldList = indexFieldListProcess;
//------------------------------------------------------ push arrIndexFieldDocument ---> indexFieldList ------------------------------
  indexFieldListDocument.indexField = arrIndexFieldDocument;
  indexDataDocument.indexFieldList = indexFieldListDocument;
//------------------------------------------------------ push indexDataProcess ---> generate2orderxml ------------------------------
  process.indexData = indexDataProcess;
//------------------------------------------------------ push indexDataDocument ---> document ------------------------------
  document.indexData = indexDataDocument;
//------------------------------------------------------ push generate2orderxml --- > processList in stack ------------------------------
  stack.processList.push({process : process});

//------------------------------------------------------ push stack --->order ------------------------------
  order.stack = stack;

  return js2xmlparser("ns2:order", order, {
    prettyPrinting : {
      enabled : false
    }
  });
}


function createArray4IndexField(length, defaultVal){
  var arrayIndexField = [];
  for(var i = 0 ; i < length ; i++)
  {
    arrayIndexField.push(defaultVal);
  }
  return arrayIndexField;
}

module.exports = GENERATE2XML;