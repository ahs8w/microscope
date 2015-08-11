Comments = new Mongo.Collection('comments');

Meteor.methods({
  commentInsert: function(commentAttributes) {
    check(this.userId, String);
    check(commentAttributes, {
      postId: String,
      body: String
    });

    var user = Meteor.user();
    var post = Posts.findOne(commentAttributes.postId);

    if (!post)
      throw new Meteor.Error('invalid-comment', 'You may only comment on a post!');

    comment = _.extend(commentAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    // update the commentsCount for associated post
    Posts.update(comment.postId, {$inc: {commentsCount: 1}}); 

    comment._id = Comments.insert(comment);
    
    // notify the post's author of the new comment
    createCommentNotification(comment);

    return comment._id;
  }
});