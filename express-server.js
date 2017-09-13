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

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

// submit username - post
app.post("/login", (req, res) => {
  const username = 'username';
  res.cookie(username, req.body.username);
  res.redirect('/urls');
  // res.redirect('Ok');
});



// Get page for new link
app.get("/urls/new", (req, res) => {
  let templateVars =  { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

// welcome root page
app.get("/", (req, res) => {
  res.end("Hello!");
});


// get index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                    username: req.cookies["username"] };
  res.render("urls_index", templateVars);
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
                      fullURL: urlDatabase[req.params.id],
                      username: req.cookies["username"] };
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