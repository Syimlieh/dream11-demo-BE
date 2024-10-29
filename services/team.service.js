const { collection } = require("../db/collections.db");
const { connectDB, getDB } = require("../db/connect");

const addTeam = async (payload) => {
  await connectDB();
  const db = getDB();
  try {
    const newTeamPlayer = await db
      .collection(collection.TEAMS)
      .insertOne(payload);
    if (!newTeamPlayer) {
      return {
        success: false,
        data: "Failed While Trying to Save Team.",
        status: 400,
      };
    }
    return {
      success: false,
      data: "Team Created Successfully.",
      status: 201,
    };
  } catch (error) {
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      error.keyValue.teamName
    ) {
      return {
        success: false,
        data: "Team with this Name Already Exists.",
        status: 409,
      };
    }
    return {
      success: false,
      data: "Failed While Trying to Save Team. Something Went Wrong.",
      status: 500,
    };
  }
};

const fetchAllTeams = async (teamQuery) => {
  await connectDB();
  const db = getDB();
  try {
    const teams = await db
      .collection(collection.TEAMS)
      .find(teamQuery)
      .sort({ totalPoints: 1 })
      .toArray();
    if (!teams.length) {
      return {
        success: false,
        data: "No New Team Found. Please add Team First.",
        status: 404,
      };
    }
    return {
      success: true,
      data: teams,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      data: "Failed While Trying to Fetch Teams. Something Went Wrong.",
      status: 500,
    };
  }
};

const updateTeam = async (teamQuery, payload) => {
  await connectDB();
  const db = getDB();
  try {
    const updatedTeams = await db
      .collection(collection.TEAMS)
      .findOneAndUpdate(teamQuery, { $set: payload }, { new: true });
    if (!updatedTeams) {
      return {
        success: false,
        data: "Failed While Trying to Update Team.",
        status: 400,
      };
    }
    return {
      success: true,
      data: updateTeam,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      data: error.message,
    };
  }
};

module.exports = {
  addTeam,
  fetchAllTeams,
  updateTeam,
};
