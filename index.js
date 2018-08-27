var settings = require('ep_etherpad-lite/node/utils/Settings');
var request = require('request');
var db = require('ep_etherpad-lite/node/db/DB').db;
var padMessageHandler = require("../src/node/handler/PadMessageHandler");
var async = require('../src/node_modules/async');
var authorManager = require("../src/node/db/AuthorManager");
var passport = require('passport');

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

  // update all group but don't wait for it because it's too slow. 
  request.get({
    url: settings.ep_group_access.userinfo_url,
    json: true
  }, function (error, response, data) {
    if (!error) {
      db.set("allGroups", data.groups.join());
    }
  });

  var padId = context.pad.id;
  var ep_group_access = {};

  // read all groups from database, even though it may be stale
  db.get("allGroups", function(err, value){
    if (value) {
      ep_group_access.groups = value.split(',');
    } else {
      ep_group_access.groups = [];
    }
    
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

exports.authorize = function(hook_name, context, cb) {
  if (context.resource.startsWith('/auth')) {
    console.info(context.resource + ' bypasses authorization cause authentication');
    return cb([true]);
  } else if (context.req.session && context.req.session.user) {
    if (context.resource.startsWith('/p/')) {
      var padId = context.resource.substring(3);
      return authorizePad(context, padId, cb);
    } else {
      console.info(context.resource + ' user ' + context.req.session.user.username + ' authorized cause resource');
      return cb([true]);
    }
  } else {
    console.info(context.resource + ' unauthorized cause no session');
    return cb([false]);
  }
}

function authorizePad(context, padId, cb) {
  if (context.req.session.user.groups) {
    return db.get("accessGroups:"+padId, function(err, value){
      if (value) {
        var padGroups = value.split(',');
        if (groupMatch(padGroups, context.req.session.user.groups)) {
          console.info(context.resource + ' user ' + context.req.session.user.username + ' authorized by group match');
          return cb([true]);
        } else {
          console.info(context.resource + ' user ' + context.req.session.user.username + ' unauthorized cause no group matches');
          context.res.status(403).send('<h1>Unauthorized</h1><p>User ' + context.req.session.user.username + ' is not authorized to access pad ' + padId + '. If please contact the pad owner ' + padOwner + ' if you believe you should have access to this pad.</p>');
          return null;
        }
      } else {
        console.info(context.resource + ' user ' + context.req.session.user.username + ' autorized for unclaimed pad');
        db.set("accessGroups:"+padId, context.req.session.user.groups.join());
        return cb([true]);
      }
    });
  } else {
    console.info(context.resource + ' user ' + context.req.session.user.username + ' unauthorized cause no group info for user');
    return cb([false]);
  }
}

function groupMatch(padGroups, userGroups) {
  var i;
  for (i = 0; i < padGroups.length; i++) {
    if (userGroups.includes(padGroups[i])) {
      return true;
    }
  }
  return false;
}

