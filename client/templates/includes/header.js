Template.header.helpers({
  activeRouteClass: function(/* route names */) {
    // allows passing an unspecified number of anonymous parameters
    // converts arguments object into a regular array and then gets rid of spacebars added hash with .pop()
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    // returns true if any routes match the current path
    var active = _.any(args, function(name) {
      return Router.current() && Router.current().route.getName() === name
    });

    // boolean && string javascript pattern
    // false && myString => false
    // true && myString => myString
    return active && 'active';
  }
});