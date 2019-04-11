const users = {
  "userRandomID": {
                    id: "userRandomID",
                    email: "user@example.com",
                    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
                    id: "user2RandomID",
                    email: "user2@example.com",
                    password: "dishwasher-funk"
                    }
}

let newEmail = process.argv.slice(2);
let user_ID = [users][user_ID];

let emailLookUp = function(newEmail) {
  for (var email in user_ID) {
    if ([user_ID]["email"] === newEmail) {
      return true;
    } else {
      return false;
    }
  }
}



let post = function() {
  if (!newEmail) {
    // res.statusCode = 400;
    // res.end("Unknown");
    return false;
  }
  if (emailLookUp() === true) {
      // res.statusCode = 400;
      // res.end("Unknown");
    return false;
  }
  users[`${user_ID}`] = { id: user_ID,
                        email: newEmail};
};
console.log(post());
  // cookieParser.JSONCookie(user_ID)
  // res.cookie("user_ID", user_ID);
  // res.redirect("/urls");
