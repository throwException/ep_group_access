var settings = require('ep_etherpad-lite/node/utils/Settings');
var request = require('request');
var db = require('ep_etherpad-lite/node/db/DB').db;
var padMessageHandler = require("../src/node/handler/PadMessageHandler");
var async = require('../src/node_modules/async');
var authorManager = require("../src/node/db/AuthorManager");

// Remove cache for this procedure
db['dbSettings'].cache = 0;

var buffer = {};

/* 
* Handle incoming messages from clients
*/
exports.handleMessage = function(hook_name, context, callback){
  var isGroupAccessMessage = false;
  if(context){
    if(context.message && context.message){
      if(context.message.type === 'COLLABROOM'){
        if(context.message.data){
          if(context.message.data.type){
            if(context.message.data.type === 'accessGroups'){
              isGroupAccessMessage = true;
            }
          }
        }
      }
    }
  }
  if(!isGroupAccessMessage){
    callback(false);
    return false;
  }

  var message = context.message.data;
  /***
    What's available in a message?
     * action -- The action IE chatPosition
     * padId -- The padId of the pad both authors are on
     * targetAuthorId -- The Id of the author this user wants to talk to
     * message -- the actual message
     * myAuthorId -- The Id of the author who is trying to talk to the targetAuthorId
  ***/
  if(message.action === 'sendAccessGroupsMessage'){
    authorManager.getAuthorName(message.myAuthorId, function(er, authorName){ // Get the authorname

      var msg = {
        type: "COLLABROOM",
        data: {
          type: "CUSTOM",
          payload: {
            action: "recieveAccessGroupsMessage",
            authorId: message.myAuthorId,
            authorName: authorName,
            padId: message.padId,
            message: message.message
          }
        }
      };
      sendToRoom(message, msg);
      saveRoomAccessGroups(message.padId, message.message);
    });
  }

  if(isGroupAccessMessage === true){
    callback([null]);
  }else{
    callback(true);
  }
}

function saveRoomAccessGroups(padId, groups){
  db.set("accessGroups:"+padId, groups.join());
}

function sendToRoom(message, msg){
  var bufferAllows = true; // Todo write some buffer handling for protection and to stop DDoS -- myAuthorId exists in message.
  if(bufferAllows){
    setTimeout(function(){ // This is bad..  We have to do it because ACE hasn't redrawn by the time the chat has arrived
      padMessageHandler.handleCustomObjectMessage(msg, false, function(){
        // TODO: Error handling.
      })
    }
    , 100);
  }
}

exports.clientVars = function(hook, context, callback){
  var padId = context.pad.id;
  var ep_group_access = {};
  request.get({
    url: settings.ep_group_access.userinfo_url,
    json: true
  }, function (error, response, data) {
    if (error) {
      ep_group_access.groups = [];
      ep_group_access.selected = [];
      return callback({ep_group_access: ep_group_access});
    }

    ep_group_access.groups = data.groups;

    db.get("accessGroups:"+padId, function(err, value){
      if (value) {
        ep_group_access.selected = value.split(',');
      } else {
        ep_group_access.selected = [];
      }
      return callback({ep_group_access: ep_group_access});
    });
  });
};

exports.authorize = function(hook_name, context) {
  console.warn(hook_name);
  console.warn(context);
}

