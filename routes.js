const { addTeam } = require("./controllers/team.controller.js");
const {
  processResult,
  teamResult,
} = require("./controllers/result.controller.js");
const Validator = require("./validations/validator.js");

// Keeping all routes here as we know there will be only few routes
module.exports = (app) => {
  // teams Routes
  app.post("/add-team", Validator("addTeamSchema"), addTeam);

  // Process result
  app.post("/process-result", processResult);

  // Team Result
  app.post("/team-result", teamResult);
};
