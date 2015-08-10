// Local collection (client only)
Errors = new Mongo.Collection(null);

throwError = function(message) {
  Errors.insert({message: message});
};