const express = require("express");
const bodyParser = require("body-parser");
var cors = require('cors')
const app = express();

let port = 3006
app.listen(port, () => {
  console.log(`Application started and Listening on port ${port}`);
});

app.use(cors())

// server css as static
app.use(express.static(__dirname));

// get our app to use body parser 
app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json());

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

app.post("/", (req, res) => {
  console.log("sssss=======", req.body);
  // var subName = req.body.yourname
  // var subEmail = req.body.youremail;
 //res.send("Hello " + subName + ", Thank you for subcribing. You email is " + subEmail);
});

app.post("/login", (req, res) => {
  console.log("sssss=======", req.body);
  res.send({status: 200, msg: "Login Successful.", data:req.body})
//   var subName = req.body.yourname
//   var subEmail = req.body.youremail;
//  res.send("Hello " + subName + ", Thank you for subcribing. You email is " + subEmail);
});

app.post("/signup", (req, res) => {
  console.log("sssss=======", req.body);
  // make 1 code for every signup
  // JHP-1
  // JHP-2
  // res.send({status: 200, msg: "Login Successful.", data:req.body})
});

app.post("/users/list", (req, res) => {
  console.log("users=======", req.body);
  let users = [{ id: 1, firstName: 'Akash', lastName: 'Patel', email: 'akash@example.com', phone: '123-456-7890', gender: 'Male', area: 'Vasna' },
  { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '987-654-3210', gender: 'Female', area: 'Sabarmati' }]
  res.send({status: 200, msg: "User fetch Successfully.", data: users})
//   var subName = req.body.yourname
//   var subEmail = req.body.youremail;
//  res.send("Hello " + subName + ", Thank you for subcribing. You email is " + subEmail);
});
