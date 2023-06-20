const express = require("express");
const cors = require("cors");
const mysql2 = require("mysql2");
const app = express();
const fs = require("fs");
const { error } = require("console");
//to access the JSON data
app.use(express.json());

app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  // Add other necessary CORS headers here
  next();
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// const db = mysql2.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "password",
//   database: "flight",
// });

var db = mysql2.createConnection({
  host: "gokhul.mysql.database.azure.com",
  user: "gokhulroot",
  password: "saumit@21",
  database: "flight",
  port: 3306,
  ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") },
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database", err);
  } else {
    console.log("Connected to database");
  }
});

app.get("/getAllids", (req, res) => {
  const today = new Date();
  const query = "SELECT id FROM addflight where departure >= ?";
  const params = [today];
  db.query(query, params, (error, results) => {
    if (error) {
      console.error(error);
    } else {
      console.log("listed successfully");
    }
    res.json(results);
  });
});

app.post("/addflights", (req, res) => {
  const flightData = req.body;
  const query =
    "INSERT INTO addflight (`flightname`, `from`, `to`, `departure`, price, seats) VALUES(?,?,?,?,?,?)";
  const values = [
    flightData.flightname,
    flightData.from,
    flightData.to,
    flightData.departureDate,
    parseInt(flightData.price),
    parseInt(flightData.seats),
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error occured during inserting", err);
      res.status(500).json({ error: "Failed to insert data into database" });
    } else {
      console.log("Data inserted successfully:", result);
      res.status(200).json({ message: "Data inserted successfully" });
    }
  });
});

app.get("/onSearch", (req, res) => {
  const { fromCity, toCity, departue, seatCount } = req.query;
  const query =
    "SELECT * FROM addflight WHERE `from` = ? AND `to` = ? AND DATE(departure) = ? AND seats >= ?";
  const params = [fromCity, toCity, departue, seatCount];
  console.log(params);
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error occured during fetching", err);
      res.status(500).json({ error: "Failed to fetch data from database" });
    } else {
      console.log("Data listed successfully", results);
    }
    res.json(results);
  });
});

app.get("/selectedFlight/:id", (req, res) => {
  const id = req.params.id;
  const query = "Select * FROM addflight WHERE `id` = ?";
  const params = [id];
  console.log(params);
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error occured during fetching", err);
      res.status(500).json({ error: "Failed to fetch data from database" });
    } else {
      console.log("Data listed successfully", results);
    }
    res.json(results);
  });
});

app.put("/updateSeatCount/:id", (req, res) => {
  const id = req.params.id;
  const seatBooked = req.body.seatBooked;
  const updateQuery = "UPDATE addflight SET seats = seats - ? WHERE id = ?";
  const params = [seatBooked, id];

  db.query(updateQuery, params, (error, results) => {
    if (error) {
      console.error("Error occured during updating", error);
      res.status(500).json({ error: "Failed to update data to database" });
    } else {
      // console.log("Data Updated successfully", results);
      const selectQuery = "SELECT * FROM addflight where id = ?";
      db.query(selectQuery, id, (error, results) => {
        if (error) {
          console.error("Error retrieving updated flight data", error);
          res
            .status(500)
            .json({ error: "Failed to retrieve updated flight data" });
        } else {
          res.json(results[0]);
        }
      });
    }
  });
  console.log(id, seatBooked);
});

app.get("/getallflights", (req, res) => {
  const query = "Select * from addflight";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error retrieving flight data", error);
      res.status(500).json({ error: "Failed to retrieve flight data" });
    } else {
      res.json(results);
    }
  });
});

app.put("/removeflight/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM addflight WHERE id = ?";
  db.query(query, id, (error, results) => {
    if (error) {
      console.error("Error retrieving flight data", error);
      res.status(500).json({ error: "Failed to retrieve flight data" });
    } else {
      const selectQuery = "SELECT * FROM addflight";
      db.query(selectQuery, id, (error, results) => {
        if (error) {
          console.error("Error retrieving updated flight data", error);
          res
            .status(500)
            .json({ error: "Failed to retrieve updated flight data" });
        } else {
          res.json(results);
        }
      });
    }
  });
});

app.get("/adminlogin", (req, res) => {
  const { email, password } = req.query;
  const query = "SELECT * FROM admin WHERE `mailid` = ? AND `password` = ?";
  const params = [email, password];
  db.query(query, params, (error, results) => {
    if (error) {
      console.error("Error retrieving data", error);
      res.status(500).json({ error: "Failed to retrieve data" });
    } else {
      console.log(results);
      let isValid = false;
      if (results.length > 0) {
        isValid = true;
      }
      res.json(isValid);
    }
  });
});

app.post("/mybookings", (req, res) => {
  const { flight, booked, userid } = req.body;
  console.log(flight, booked);
  const query =
    "INSERT INTO mybookings (`flightname`, `from`, `to`, `departure`, price, seats, `userid`) VALUES(?,?,?,?,?,?,?)";
  const values = [
    flight.flightname,
    flight.from,
    flight.to,
    flight.departure,
    parseInt(flight.price),
    parseInt(booked),
    userid,
  ];
  console.log(values);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error occured during inserting", err);
      res.status(500).json({ error: "Failed to insert data into database" });
    } else {
      console.log("Data inserted successfully:", result);
      res.status(200).json({ message: "Data inserted successfully" });
    }
  });
});

app.get("/mylist/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT * FROM mybookings WHERE `userid` = ?";
  db.query(query, userId, (error, results) => {
    if (error) {
      console.error("Error occured during listing", err);
      res.status(500).json({ error: "Failed to fetch data from database" });
    } else {
      console.log("Data fetched successfully:", results);
      // res.status(200).json({ message: "Data fetched successfully" });
      const data = res.json(results);
      console.log(data);
    }
  });
});
