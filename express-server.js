const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "asdfas": 'y',
  "asdfasd": 'n'
};

let users = {
  "YYu123": {
    id: "YYu123",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    shortLinks: ["b2xVn2",'asdfas','asdfasd']
  },
 "ABC123": {
    id: "ABC123",
    email: "p@p.com",
    password: "asdf",
    shortLinks: ["9sm5xK"]
  }
}

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// dissipate cookie information to other pages
app.use(function (req, res, next) {
  const userID = req.cookies['user_id'];
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
  if (isEmailStored(req.body.email) && isPasswordStored(req.body.password)){
    for (var i in users) {
      if (users[i].email === req.body.email) {
        res.cookie("user_id", users[i]['id']);
        res.redirect('/urls');
      }
    }
  } else {
    res.sendStatus(400);
  }
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login');
});


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
  users[id] = {id: id,
               email: req.body.email,
              password: req.body.password}
  res.cookie('user_id', id);
  res.redirect('/urls');
})



// get registration page
app.get("/register", (req, res) => {
  res.render('register');
})

// public index page
app.get("/urls/public", (req, res) => {
  let templateVars = { urls : urlDatabase }
  res.render("urls_public", templateVars);
});

// Get page for new link
app.get("/urls/new", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
    return;
  }
  res.render("urls_new");
})

// welcome root page
app.get("/", (req, res) => {
  res.end("Hello!");
});


// get index page
app.get("/urls", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login')
    return;
  }
  let userId = req.cookies['user_id'];
  let links = users[userId]['shortLinks'];
  let abbLinks = links.reduce( (result, link) => {
    result[link] = urlDatabase[link];
    return result;
  }, {});
  // let templateVars = { links: urlDatabase,
  //                     };
  res.render("urls_index", {abbLinks});
});

// create a new link
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(req.body.longURL);  // debug statement to see POST parameters
  urlDatabase[shortURL] = req.body.longURL;
  let userID = req.cookies['user_id'];
  users[userID].shortLinks.push(shortURL);
  res.redirect(`urls/${shortURL}`);
});


// delete short-link
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.cookies['user_id'];
  let linkIndex = users[userID].shortLinks.indexOf(req.params.id);
  delete users[userID].shortLinks[linkIndex];
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');         // Respond with 'Ok' (we will replace this)
});

// show an individual page by its id  (edit)
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                      fullURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// edit link on show page
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.newName;
  let templateVars = { shortURL: req.params.id,
                       fullURL: urlDatabase[req.params.id] };
  res.render("/urls");
});


//example using shortURL instead of id
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