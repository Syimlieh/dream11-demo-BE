const TeamService = require("../services/team.service.js");
const { calculatePoints } = require("../utils/general.util.js");

const processResult = async (req, res) => {
  /*
    #swagger.tags = ['Result']
    #swagger.description = 'Process Result'
    #swagger.summary = 'Process Result'
  */
  const query = {
    totalPoints: null,
  };
  const fetchAllTeams = await TeamService.fetchAllTeams(query);
  if (!fetchAllTeams.success) {
    return res.status(fetchAllTeams.status).json({
      success: fetchAllTeams.success,
      error: fetchAllTeams.data,
    });
  }

  const teams = fetchAllTeams.data;
  for (const team of teams) {
    const { data, success } = calculatePoints(team);
    if (!success) {
      return res.status(400).json({
        success,
        error: data,
      });
    }

    // Update the current team points to the database
    const teamQuery = { _id: team._id };
    const updateResult = await TeamService.updateTeam(teamQuery, data);
    if (!updateResult.success) {
      return res.status(updateResult.status).json({
        success: updateResult.success,
        error: updateResult.data,
      });
    }
  }
  res.status(200).json({
    success: true,
    data: "Points calculated and updated successfully for all Existing teams.",
  });
};

const teamResult = async (req, res) => {
  /*
    #swagger.tags = ['Result']
    #swagger.description = 'Team Results'
    #swagger.summary = 'Team Results'
  */

  const query = {
    totalPoints: {
      $ne: null,
    },
  };
  const fetchAllTeams = await TeamService.fetchAllTeams(query);
  if (!fetchAllTeams.success) {
    return res.status(fetchAllTeams.status).json({
      success: fetchAllTeams.success,
      error: fetchAllTeams.data,
    });
  }

  const teams = fetchAllTeams.data;

  let maxPoints = -Infinity;
  let winners = [];
  let others = [];
  teams.forEach((team) => {
    if (team.totalPoints > maxPoints) {
      maxPoints = team.totalPoints;
      // Move all previous winners to others if new max is found
      others = others.concat(winners);
      winners = [team];
    } else if (team.totalPoints === maxPoints) {
      winners.push(team);
    } else {
      others.push(team);
    }
  });

  const result = {
    winners,
    others,
  };
  return res.status(fetchAllTeams.status).json({
    success: fetchAllTeams.success,
    data: result,
  });
};

module.exports = {
  processResult,
  teamResult,
};
