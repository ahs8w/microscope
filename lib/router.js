// use layout template as default for all routes
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() { return Meteor.subscribe('posts'); }
});

// root path routes to postsList => renders template
// allows for the {{pathFor 'postsList'}} Spacebars helper
Router.route('/', {name: 'postsList'});
Router.route('/posts/:_id', {
  name: 'postPage',
  data: function() { return Posts.findOne(this.params._id); }
});

// hook
Router.onBeforeAction('dataNotFound', {only: 'postPage'});