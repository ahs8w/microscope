Notifications = new Mongo.Collection("notifications");

// allow/deny callbacks -> check if user has permission
Notifications.allow({
  update: function(userId, doc, fieldNames) {
    // userId => user who wants to update the document
    // doc => current (unmodified) version of the document from db
    // fieldNames => array of top-level fields in doc that client wants to modify
    return ownsDocument(userId, doc) && fieldNames.length === 1 && fieldNames[0] === 'read';
  },
});

createCommentNotification = function(comment) {
  var post = Posts.findOne(comment.postId);
  if (comment.userId !== post.userId) {
    Notifications.insert({
      userId: post.userId,
      postId: post._id,
      commentId: comment._id,
      commenterName: comment.author,
      read: false
    });
  }
}