function rowOrColumn() {
  if ($(window).width() > $(window).height()) {
    $("a, body").addClass('row');
    $("a, body").removeClass('column');
  } else {
    $("a, body").addClass('column');
    $("a, body").removeClass('row');
  }
}

document.getElementById("bigone1").scrollIntoView();

rowOrColumn();

$(window).on('resize', function() {
  rowOrColumn();
});