const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const mongoose=require('mongoose');
let user=require('./db.js')
let userFeedback=require('./feedback.js');
let business=require('./bussinesDB.js');
let required_amenities=require('./amenties.js');
const cors =require('cors');
const { spawn } = require("child_process");
// import ""

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

// connecting to apartment
mongoose
  .connect(
    "mongodb+srv://tanishmodase18:projectcluster@cluster0.wbjdiu1.mongodb.net/majorDB?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("connected to apartment DB");
  })
  .catch((err) => {
    console.log(err);
  });

//schema
const apartmentSchema = mongoose.Schema({
  Apartment_Name: String,
  Apartment_Location: String,
  Apartment_Rent: String,
  Apartment_Deposit: String,
  Apartment_Negotiable: String,
  Apartment_Image_URL: String,
  Apartment_Latitude: String,
  Apartment_Longitude: String,
  Cluster: Number,
  Score: String,
});

const apartment = mongoose.model("apartment", apartmentSchema);

app.get("/", function (req, res) {
  res.send("Hello this my server");
});

app.get("/getdata", function (req, res) {
  apartment.find()
    .then((val) => {
      //  console.log(val);
      res.send(val);
    })
    .catch((err) => {
      console.log(err);
    });
});


app.get("/amenities",function(req,res){
  required_amenities.find().then((val) =>{
    console.log(val);
    res.send(val);
  }).catch((err) =>{
    console.log(err)
  })
})


app.post("/feedback",function(req,res){
      const newFeedback= new userFeedback({
        feedback:req.body.feedback.value
      })

      newFeedback.save();
      console.log('Feedback added');
})

app.post("/business",function(req,res){
   const newBusiness= new business({
      Business_Name:req.body.business_name,
      Type:req.body.business_type,
      keywords:req.body.keywords,
   })

    newBusiness.save();
    console.log("New business info added");
})



app.post("/", function (req, res) {
 
  const newUser = new user({
    name: req.body.Full_name,
    city: req.body.city,
    gender: req.body.gender,
    age: parseInt(req.body.age),
    occupation: req.body.occupation,
    budget:parseInt(req.body.budget),
    area: req.body.area,
    preference: req.body.pref,
  });

  newUser.save();
  console.log("new user added");

  const pythonScript = spawn("python", ["Apartment_scraping.py"]);

  // Listen for data from the script's stdout
  pythonScript.stdout.on("data", (data) => {
    console.log("Python script executed");
  });

  pythonScript.stderr.on("data", (data) => {
    console.error(`from Python script ${data}`);
  });

  // Listen for the script to close
  pythonScript.on("close", (code) => {
    console.log(`Python script exited with code`);
    res.send(`Python script exited with code`);
  });
});

app.listen(5000,function(req,res){
    console.log("Server is running on port 5000");
})