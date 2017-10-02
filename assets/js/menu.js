$.ajax({
  url: "menu.html",
  success: function(res) {
    $("#menu-bar").html(res);
  }
});

