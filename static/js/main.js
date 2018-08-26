exports.postAceInit = function(hook_name, args) {

  // if the button already exists, don't write it again..
  if($('#ep_group_access_button_span').length === 0) {
    var link = clientVars.ep_group_access.link;
    var button = "<li><a id='ep_group_access_button'><span id='ep_group_access_button_span' class='buttonicon'><img id='ep_group_access_button_image' height=\"16\" width=\"16\" src=\"/static/plugins/ep_group_access/static/image/lock.png\"/></span></a></li><li class=\"separator\"></li>";
    var $editBar = $("#editbar");
    $editBar.contents().find(".buttonicon-import_export").parent().parent().before(button);
    $('#ep_group_access_button_span').css({"background-image":"none", "width": "auto", "color":"#666", "font-size":"16px", "margin-top":"-3px"});
    window.onclick = function(event) {
      if ((event.target.id == 'ep_group_access_button') || 
          $(event.target).parents("#ep_group_access_button").length) {
        var display = window.getComputedStyle(document.getElementById('ep_group_access_popup')).getPropertyValue('display');
        if (display === 'none') {
          $('#ep_group_access_popup').css({ "display":"block"});
        } else {
          $('#ep_group_access_popup').css({ "display":"none"});
        }
      } else if ((event.target.id == 'ep_group_access_popup') || 
                 $(event.target).parents("#ep_group_access_popup").length) {
      } else {
        $('#ep_group_access_popup').css({ "display":"none"});
      }
    };
  }

  if($('#ep_group_access_popup').length === 0) {
    var box = "<div id='ep_group_access_popup' class='popup'><h2>Group Access</h2></div>";
    $('#editorcontainerbox').after(box);
    $('#ep_group_access_popup').css({ "position":"absolute", "right":"16px", "top":"128px", "width":"500px", "height":"300px", "z-index":"500", "display":"none"});
  }

}
