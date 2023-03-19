const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "covid19India.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};

initializeDBAndServer();

app.get("/states/", async (request, response) => {
  const allStatusQuery = `SELECT * FROM state;`;
  const statesArray = await db.all(allStatusQuery);
  response.send(statesArray);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const stateArray = await db.get(getStateQuery);
  response.send(stateArray);
});

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    death,
  } = districtDetails;
  const postDistrictDetailsQuery = `INSERT INTO district(district_name, state_id, cases, cured, active, death) VALUES (${districtname}, ${stateId}, ${cases}, ${cured}, ${active}, ${death});`;
  await db.run(postDistrictDetailsQuery);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const districtArray = await db.get(getDistrictQuery);
  response.send(districtArray);
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    death,
  } = districtDetails;

  const updateDistrictDetailsQuery = `UPDATE district SET district_name = ${districtName}, state_id =  ${stateId}, cases = ${cases}, cured = ${cured}, active = ${active}, death = ${death} WHERE district_id = ${districtId};`;
  await db.run(updateDistrictDetailsQuery);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const caseQuery = `SELECT cases,cured, active, death FROM district WHERE state_id = ${stateId};`;
  const casesArray = await db.all(caseQuery);
  response.send(casesArray);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;

  const getSateNameQuery = `SELECT state_name FROM district LEFT JOIN state ON district.state_id = state.state_id WHERE district_id = ${districtId};`;
  const stateName = await db.all(getSateNameQuery);
  response.send(stateName);
});

module.exports = app;
