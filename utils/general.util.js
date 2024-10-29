const PlayerJson = require("../data/players.json");
const MatchData = require("../data/match.json");
const {
  WICKET_TYPES,
  FIELDING_TYPES,
  BOWLING_POINTS,
  BATTING_POINTS,
  FIELDING_POINTS,
  MAIN_PLAYER_POINTS,
} = require("./constants.util");

const checkPlayers = ({ players, captain, viceCaptain }) => {
  if (captain === viceCaptain) {
    return {
      success: false,
      data: "Captain And Vice Captain cannot be the same.",
      status: 400,
    };
  }
  // Check if captain and vice captain are included in the player list
  if (
    !players.some((p) => p.name === captain) ||
    !players.some((p) => p.name === viceCaptain)
  ) {
    return {
      success: false,
      data: "Captain And Vice Captain are not in the Player List.",
      status: 400,
    };
  }

  let teamCount = {};
  let roleCount = {
    WICKETKEEPER: 0,
    BATTER: 0,
    "ALL-ROUNDER": 0,
    BOWLER: 0,
  };

  for (let player of players) {
    // Check if the selected player actually Exist.
    const playerData = PlayerJson.find((p) => p.Player === player.name);
    if (!playerData) {
      return {
        success: false,
        data: `Player ${player} does not exist in the database.`,
        status: 400,
      };
    }

    // Count Team members
    if (teamCount[playerData.Team]) {
      teamCount[playerData.Team]++;
    } else {
      teamCount[playerData.Team] = 1;
    }

    // Count Role
    if (playerData.Role in roleCount) {
      roleCount[playerData.Role]++;
    }
  }

  // Only 10 Playser can be selected from a Single Team
  for (let team in teamCount) {
    if (teamCount[team] > 10) {
      return {
        success: false,
        data: `More than 10 players selected from team ${team}.`,
        status: 400,
      };
    }
  }

  if (
    roleCount.WICKETKEEPER < 1 ||
    roleCount.WICKETKEEPER > 8 ||
    roleCount.BATTER < 1 ||
    roleCount.BATTER > 8 ||
    roleCount["ALL-ROUNDER"] < 1 ||
    roleCount["ALL-ROUNDER"] > 8 ||
    roleCount.BOWLER < 1 ||
    roleCount.BOWLER > 8
  ) {
    return {
      success: false,
      data: `Please ensure 1-8 players are selected for each role.`,
      status: 400,
    };
  }

  return {
    success: true,
    status: 200,
  };
};

const calculatePoints = (team) => {
  const points = {};
  const catches = {};
  const runsScored = {};
  const wicketsTaken = {};
  const oversBowled = {};

  const players = team.players.map((item) => item.name);
  players.forEach((player) => {
    points[player] = 0;
    catches[player] = 0;
    runsScored[player] = 0;
    wicketsTaken[player] = 0;
    oversBowled[player] = [];
  });

  MatchData.forEach((delivery) => {
    const {
      batter,
      bowler,
      overs,
      total_run,
      fielders_involved: fielder,
      batsman_run,
      isWicketDelivery,
      player_out,
      kind,
    } = delivery;

    // Batting points
    if (players.includes(batter)) {
      runsScored[batter] += batsman_run;

      if (batsman_run > 0) points[batter] += BATTING_POINTS.RUN; // Run
      if (batsman_run === 4) points[batter] += BATTING_POINTS.BOUNDARY_BONUS; // Boundary Bonus
      if (batsman_run === 6) points[batter] += BATTING_POINTS.SIX_BONUS; // Six Bonus

      // Check for duck dismissal
      if (isWicketDelivery && player_out === batter) {
        points[batter] += BATTING_POINTS.DUCK_DISMISSAL;
      }
    }

    // Bowling points
    if (players.includes(bowler)) {
      // In the rules wicket and bonus have two diff point
      // So i am assuming that any out except by run_out. Point will be givent to bowler too.
      if (isWicketDelivery && kind !== FIELDING_TYPES.RUN_OUT) {
        points[bowler] += BOWLING_POINTS.WICKET; // Wicket
        if (Object.values(WICKET_TYPES).includes(kind)) {
          points[bowler] += BOWLING_POINTS.BONUS; // Bonus
        }
        wicketsTaken[bowler] += 1;
      }

      // I did not find any data from match.json that i can test for this case
      if (!oversBowled[bowler][overs]) {
        oversBowled[bowler][overs] = { runsPerOver: 0, balls: 0 };
      }
      oversBowled[bowler][overs].runsPerOver += total_run;
      oversBowled[bowler][overs].balls += 1;

      if (oversBowled[bowler][overs].balls === 6) {
        if (oversBowled[bowler][overs].runsPerOver === 0) {
          points[bowler] += BOWLING_POINTS.MAIDEN_OVER; // Maiden Over
        }
      }
    }

    // Fielding points
    if (fielder && players.includes(fielder)) {
      if (kind === FIELDING_TYPES.CAUGHT) {
        points[fielder] += FIELDING_POINTS.CATCH;
        catches[fielder] += 1;
      }

      // Not sure for these two. Not found in data.
      if (kind === FIELDING_TYPES.STUMPING) {
        points[fielder] += FIELDING_POINTS.STUMPING; // Stumping
      }
      if (kind === FIELDING_TYPES.RUN_OUT) {
        points[fielder] += FIELDING_POINTS.RUN_OUT; // Run out
      }
    }
  });

  Object.keys(catches).forEach((player) => {
    if (catches[player] >= 3) {
      points[player] += FIELDING_POINTS.THREE_CATCH_BONUS; // 3 Catch Bonus
    }
  });

  // bonuses for runs scored
  Object.keys(runsScored).forEach((player) => {
    if (runsScored[player] >= 30 && runsScored[player] < 50)
      points[player] += BATTING_POINTS.THIRTY_RUN_BONUS; // 30 Run Bonus
    if (runsScored[player] >= 50 && runsScored[player] < 100)
      points[player] += BATTING_POINTS.HALF_CENTURY_BONUS; // Half-century Bonus
    if (runsScored[player] >= 100)
      points[player] += BATTING_POINTS.CENTURY_BONUS; // Century Bonus
  });

  // wicket Count
  Object.keys(wicketsTaken).forEach((player) => {
    if (wicketsTaken[player] === 3)
      points[player] += BOWLING_POINTS.THREE_WICKET_BONUS;
    if (wicketsTaken[player] === 4)
      points[player] += BOWLING_POINTS.FOUR_WICKET_BONUS;
    if (wicketsTaken[player] >= 5)
      points[player] += BOWLING_POINTS.FIVE_WICKET_BONUS;
  });

  // Adjust points for captain and vice-captain
  const { captain, viceCaptain } = team;
  if (points[captain]) points[captain] *= MAIN_PLAYER_POINTS.CAPTAIN;
  if (points[viceCaptain])
    points[viceCaptain] *= MAIN_PLAYER_POINTS.VICE_CAPTAIN;

  const totalPoints = Object.values(points).reduce(
    (acc, curr) => acc + curr,
    0
  );
  const playerPointsArray = Object.keys(points).map((player) => ({
    name: player,
    points: points[player],
  }));

  let result = { players: playerPointsArray, totalPoints };
  return { success: true, data: result, status: 200 };
};

module.exports = {
  checkPlayers,
  calculatePoints,
};
