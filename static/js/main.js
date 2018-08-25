exports.postAceInit = function(hook_name, args) {

  // if the button already exists, don't write it again..
  if($('#ep_group_access_span').length !== 0) return;

  var link = clientVars.ep_group_access.link;

  var button = "<li><a target='_blank' href='"+link+"'><span id='ep_group_access_span' class='buttonicon'><img height=\"16\" width=\"16\" src=\"/static/plugins/ep_group_access/static/image/lock.png\"/></span></a></li><li class=\"separator\"></li>";
  var $editBar = $("#editbar");

  $editBar.contents().find(".buttonicon-import_export").parent().parent().before(button);

  $('#ep_group_access_span').css({"background-image":"none", "width": "auto", "color":"#666", "font-size":"16px", "margin-top":"-3px"});
}
