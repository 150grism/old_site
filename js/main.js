function rowOrColumn() {
  if ($(window).width() > $(window).height()) {
    $("a, body").addClass('row');
    $("a, body").removeClass('column');
  } else {
    $("a, body").addClass('column');
    $("a, body").removeClass('row');
  }
}

rowOrColumn();

$(window).on('resize', function() {
  rowOrColumn();
  console.log('w: ' + $(window).width() + '/ h: ' + $(document).height());
});