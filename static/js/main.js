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
      } else if (event.target.id == 'ep_group_access_save') {
        save_groups();  
        $('#ep_group_access_popup').css({ "display":"none"});
      } else if ((event.target.id == 'ep_group_access_popup') || 
                 $(event.target).parents("#ep_group_access_popup").length) {
      } else {
        $('#ep_group_access_popup').css({ "display":"none"});
      }
    };
  }

  if($('#ep_group_access_popup').length === 0) {
    var box = "<div id='ep_group_access_popup' class='popup'><h2>Group Access</h2><div id='ep_group_access_boxes'></div><p><input name='submit' value='Save' id='ep_group_access_save' type='submit' /></p></div>";
    $('#editorcontainerbox').after(box);
    $('#ep_group_access_popup').css({ "position":"absolute", "right":"16px", "top":"128px", "width":"300px", "height":"200px", "z-index":"500", "display":"none"});
    update_group_boxes();
  }

}

function update_group_boxes() {
  var groups = clientVars.ep_group_access.groups;
  var i;
  var text = "";
  for (i = 0; i < groups.length; i++) {
    text += "<p><input type='checkbox' name='ep_group_access_group_" + groups[i] + "' value='" + groups[i] + "'>" + groups[i] + "<br></p>"
  }
  var boxes = document.getElementById("ep_group_access_boxes");
  boxes.innerHTML = text;
  pad.groups = groups;
  update_groups(clientVars.ep_group_access.selected);
}

function update_groups(selected) {
  for (i = 0; i < pad.groups.length; i++) {
    var box = document.getElementById("ep_group_access_group_" + pad.groups[i]);
    if (box) {
      box.checked = selected.includes(pad.groups[i]);
    }
  }
}

function save_groups() {
  var myAuthorId = pad.getUserId();
  var padId = pad.getPadId();
  var selected = [];
  for (i = 0; i < pad.groups.length; i++) {
    var box = document.getElementById("ep_group_access_group_" + pad.groups[i]);
    if (box) {
      if (box.selected) {
        selected.push(pad.groups[i]);
      }
    }
  }
  var message = {
    type : 'accessGroups',
    action : 'sendAccessGroupsMessage',
    message : selected,
    padId : padId,
    myAuthorId : myAuthorId
  }
  pad.collabClient.sendMessage(message);  // Send the chat position message to the server
}
