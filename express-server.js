const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  "YYu123": {
    id: "YYu123",
    email: "user@example.com",
    password: "asdf",
    shortLinks: ["b2xVn2"]
  },
 "ABC123": {
    id: "ABC123",
    email: "p@p.com",
    password: "asdf",
    shortLinks: ["9sm5xK"]
  }
}



// dissipate cookie information to other pages
app.use(function (req, res, next) {
  const userID = req.session['user_id'];
  res.locals = {
    urlDatabase: urlDatabase,
    user: users[userID]
  };
  next();
});


// get login page
app.get("/login", (req, res) => {
  res.render('login');
})

// login email & password - post
app.post("/login", (req, res) => {
  for (let id in users) {
    if (users[id].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[id].password)) {
        req.session.user_id = users[id]['id'];
        res.redirect('/urls')
        return;
      }
    }
  }
  res.sendStatus(400);
});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function isEmailUnique(emailValue) {
  for (var keys in users) {
    if( users[keys].email === emailValue ) {
      return true;
    }
  }
}

function isEmailStored(emailValue) {
  for (var keys in users) {
    if (users[keys]['email'] === emailValue ) {
      return true;

    }
  }
}

function isPasswordStored(passwordValue) {
  for (var keys in users) {
    if (users[keys]['password'] === passwordValue ) {
      return true;
    }
  }
}


// submit registration info
app.post("/register", (req, res) => {
  let emailValue = req.body.email;

  if (!emailValue || !req.body.password) {
    res.sendStatus(400);
    return;
  } else if (isEmailUnique(emailValue)) {
    res.sendStatus(400);
    return;
  }
  let id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[id] = {id: id,
               email: req.body.email,
              password: hashedPassword,
              shortLinks: []}
  req.session.user_id = id;
  res.redirect('/urls');
})



// get registration page
app.get("/register", (req, res) => {
  res.render('register');
})

// public index page
app.get("/public", (req, res) => {
  let templateVars = { urls : urlDatabase }
  res.render("urls_public", templateVars);
});

// Get page for new link
app.get("/urls/new", (req, res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
    return;
  }
  res.render("urls_new");
})

// welcome root page
app.get("/", (req, res) => {
  res.render("home");
});


// get index page
app.get("/urls", (req, res) => {
  if (!req.session['user_id']) {
    res.redirect('/login')
    return;
  }
  let userId = req.session['user_id'];
  let links = users[userId]['shortLinks'];
  if (links === null || links === undefined ) {
    var abbLinks = {};
  } else {
     var abbLinks = links.reduce( (result, link) => {
    result[link] = urlDatabase[link];
    return result;
    }, {});
  }
  // let templateVars = { links: urlDatabase,
  //                     };
  res.render("urls_index", {abbLinks});
});

// create a new link
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(req.body.longURL);  // debug statement to see POST parameters
  urlDatabase[shortURL] = req.body.longURL;
  let userID = req.session['user_id'];
  users[userID]['shortLinks'].push(shortURL);
  res.redirect(`urls/`);
});


// delete short-link
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session['user_id'];
  let linkIndex = users[userID].shortLinks.indexOf(req.params.id);
  delete users[userID].shortLinks[linkIndex];
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');         // Respond with 'Ok' (we will replace this)
});

// show an individual page by its id  (edit)
app.get("/urls/:id", (req, res) => {
   if (!req.session['user_id']) {
    res.redirect('/login')
    return;
  }
  let templateVars = { shortURL: req.params.id,
                      fullURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// edit link on show page
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.newName;
  let templateVars = { shortURL: req.params.id,
                       fullURL: urlDatabase[req.params.id] };
  res.redirect("/urls");
});


// redirect - link
app.get("/u/:shortURL/", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// json code
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });



// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});