// this creates a global helper usable within any template
Template.registerHelper('pluralize', function(n, thing) {
  if (n ===1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});