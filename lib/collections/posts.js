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
// methods assume data is correct and are unaffected by the above callbacks (allow // deny)
Meteor.methods({
  postInsert: function(postAttributes) {
    // check -> used to assert that arguments have the right types and structure
    // security measure so that only valid structures can be passed across the wire
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
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
      votes: 0
    });

    var postId = Posts.insert(post);

    return {
      _id: postId
    };
  },
  upvote: function(postId) {
    check(this.userId, String);
    check(postId, String);

    // find posts with this _id which the user hasn't yet voted for and update them with this information
    var affected = Posts.update({
      _id: postId,
      upvoters: {$ne: this.userId}
    }, {
      $addToSet: {upvoters: this.userId},
      $inc: {votes: 1}
    });

    if (! affected)
      throw new Meteor.Error('invalid', "You weren't able to upvote that post");
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