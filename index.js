var settings = require('ep_etherpad-lite/node/utils/Settings');

exports.clientVars = function(hook, context, callback){
  var ep_group_access = {};
  try {
    if (settings.ep_group_access) {
       if(!settings.ep_group_access.link){
         console.warn("No link set for ep_group_access, add ep_group_access.link to settings.json");
         ep_group_access.link = "https://github.com/JohnMcLear/ep_group_access";
       }else{
         ep_group_access.link = settings.ep_group_access.link;
       }
    } else {
      ep_group_access = {};
      ep_group_access.link = "https://github.com/JohnMcLear/ep_group_access";
      console.warn("No link set for ep_group_access, add ep_group_access.link to settings.json");
    }
  } catch (e){
  }
  return callback({ep_group_access: ep_group_access});
};
