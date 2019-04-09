function generateRandomString() {
  var newURL = Math.random().toString(36).substring(7);
  console.log(newURL);
}

generateRandomString();