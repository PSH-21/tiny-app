const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "YYu123": {
    id: "YYu123",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "ABC123": {
    id: "ABC123",
    email: "user2@example.com",
    password: "dishwasher-funk"
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
  if (!isEmailStored(req.body.email) ||
    !isPasswordStored(req.body.pasword)) {
    res.sendStatus(400);
    return;
  }

  res.cookie(user_id, req.body.id);
  res.redirect('/urls');

  // res.redirect('Ok');
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
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
    if (users[keys].email === emailValue ) {
      return true;
    }
  }
}

function isPasswordStored(passwordValue) {
  for (var keys in users) {
    if (users[keys].password === passwordValue ) {
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

// Get page for new link
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

// welcome root page
app.get("/", (req, res) => {
  res.end("Hello!");
});


// get index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  res.render("urls_index");
});

// update a link on index page
app.post("/urls/", (req, res) => {
  let shortURL = generateRandomString(req.body.longURL);  // debug statement to see POST parameters
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});


// delete short-link
app.post("/urls/:id/delete/", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('urls');         // Respond with 'Ok' (we will replace this)
});

// show an individual page by its id
app.get("/urls/:id/", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                      fullURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// create a new shortlink on urls/new
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.newName;
  let templateVars = { shortURL: req.params.id,
                       fullURL: urlDatabase[req.params.id] };
  res.render("/urls");
});

// json code
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// example using shortURL instead of id
// app.get("/u/:shortURL/", (req, res) => {
//   let longURL = urlDatabase[req.params.shortURL];
//   res.redirect(longURL);
// });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});