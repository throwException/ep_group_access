var settings = require('ep_etherpad-lite/node/utils/Settings');

exports.clientVars = function(hook, context, callback){
  var ep_group_access = {};
  try {
    if (settings.ep_group_access){
       if(!settings.ep_group_access.link){
         console.warn("No link set for ep_group_access, add ep_group_access.link to settings.json");
         ep_group_access.link = "https://github.com/JohnMcLear/ep_group_access";
       }else{
         ep_group_access.link = settings.ep_group_access.link;
       }
       if(!settings.ep_group_access.text){
         ep_group_access.text = "NO TEXT SET";
         console.warn("No text set for ep_group_access, add ep_group_access.text to settings.json");
       }else{
         ep_group_access.text = settings.ep_group_access.text;
       }
       if(!settings.ep_group_access.before){
         ep_group_access.before = "#timesliderlink";
         console.info("No before set for ep_group_access, this may be intentional, add ep_group_access.before to settings.json");
       }else{
         ep_group_access.before = settings.ep_group_access.before;
       }
       if(!settings.ep_group_access.classes){
         ep_group_access.classes = "grouped-left";
         console.info("No classes set for ep_group_access, this may be intentional, add ep_group_access.classes to settings.json");
       }else{
         ep_group_access.classes = settings.ep_group_access.classes;
       }
       if(!settings.ep_group_access.after){
         console.info("No after set for ep_group_access, this may be intentional, add ep_group_access.classes to settings.json");
       }else{
         ep_group_access.after = settings.ep_group_access.after;
       }

    }else{
      ep_group_access = {};
      ep_group_access.link = "https://github.com/JohnMcLear/ep_group_access";
      ep_group_access.text = "NO TEXT SET";
      ep_group_access.before = ".buttonicon-history";
      ep_group_access.classes = "grouped-right";
      console.warn("No link set for ep_group_access, add ep_group_access.link to settings.json");
      console.warn("No text set for ep_group_access, add ep_group_access.text to settings.json");
    }
  } catch (e){
  }
  return callback({ep_group_access: ep_group_access});
};
