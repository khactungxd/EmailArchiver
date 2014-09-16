var schema = {};
schema.order = function () {
  this['@'] = {"xmlns:ns2": "http://oxseed.com/data/order", "xmlns:ns3": "http://oxseed.com/data/commons/entrylist", "xmlns:ns4": "http://oxseed.com/data/extension/metadata", "xmlns:ns5": "http://oxseed.com/data/extension/orderdeps"};
  this['id'] = "";
  this['stack'] = {};
  this['actionList'] = {"action": []};
  this['mandant'] = "";
  this['inputChannel'] = "";
  this['exportChannel'] = "";
  this['additionalOrderInfo'] = {};
};
schema.Stack = function () {
  this['id'] = "";
  this['processList'] = [];
  this['additionalStackInfo'] = {};
};
schema.Process = function () {
  this['id'] = "";
  this['documentList'] = [];
  this['actionList'] = {"action": []};
  this['processType'] = "";
  this['processPriority'] = "";
  this['indexData'] = {};
  this['additionalProcessInfo'] = {};
  this['systemMessages'] = {};
};
schema.Document = function () {
  this['id'] = "";
  this['idType'] = "";
  this['actionList'] = {"action": []};
  this['inputFileNameList'] = [];
  this['tempFileNameList'] = [];
  this['inputType'] = "";
  this['documentType'] = "";
  this['indexData'] = {};
  this['additionalDocumentInfo'] = {};
};
schema.Action = function () {
  this['condition'] = "";
  this['name'] = "";
  this['creationDate'] = "";
  this['createdBy'] = "";
  this['status'] = {};
  this['statusDescription'] = "";
  this['updateDate'] = "";
  this['updateBy'] = "";
  this['priority'] = 0;
  this['argumentList'] = [];
};
schema.IndexField = function () {
  this['name'] = "";
  this['value'] = "";
};
schema.IndexFieldList = function () {
  this['indexField'] = [];
};
schema.IndexData = function () {
  this['indexFieldList'] = {};
};
schema.ActionStatus = function () {
};
schema.AnyMap = function () {
  this['mapEntry'] = {"key": "", "value": []};
};
module.exports = schema;