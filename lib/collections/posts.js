Posts = new Mongo.Collection("posts");

// allow/deny callbacks -> check if user has permission
Posts.allow({
  update: function(userId, post) { return ownsDocument(userId, post); },
  remove: function(userId, post) { return ownsDocument(userId, post); }
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following two fields
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});
Posts.deny({
  update: function(userId, post, fieldNames, modifier) {
    // we’re calling validatePost on the contents of the modifier’s $set property (as in Posts.update({$set: {title: ..., url: ...}}) ).
    var errors = validatePost(modifier.$set);
    return errors.title || errors.url
  }
});

// methods are defined here to allow for latency compensation (optimistic ui)
// methods should be used when there are auxiliary tasks which need to be performed (extra properties, checking for existing urls)
Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });

    var errors = validatePost(postAttributes);
    if (errors.title || errors.url)
      throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }

    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    var postId = Posts.insert(post);

    return {
      _id: postId
    };
  }
});

validatePost = function (post) {
  var errors = {};

  if (!post.title)
    errors.title = "Please fill in a headline";

  if (!post.url)
    errors.url = "Please fill in a URL";

  return errors;
}