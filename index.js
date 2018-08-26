var settings = require('ep_etherpad-lite/node/utils/Settings');
var request = require('request');

exports.clientVars = function(hook, context, callback){
  var ep_group_access = {};
  if (settings.ep_group_access) {
     if(!settings.ep_group_access.link){
       console.warn("No link set for ep_group_access, add ep_group_access.link to settings.json");
       ep_group_access.link = "https://github.com/JohnMcLear/ep_group_access";
     } else {
       ep_group_access.link = settings.ep_group_access.link;
     }
  } else {
    ep_group_access = {};
    ep_group_access.link = "https://github.com/JohnMcLear/ep_group_access";
    console.warn("No link set for ep_group_access, add ep_group_access.link to settings.json");
  }
    
  request.get({
    url: settings.ep_group_access.userinfo_url,
    json: true
  }, function (error, response, data) {
    if (error) {
      return callback({ep_group_access: ep_group_access});
    }

    ep_group_access.groups = data.groups;
    return callback({ep_group_access: ep_group_access});
  });
};
