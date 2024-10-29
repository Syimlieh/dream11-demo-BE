const Joi = require("joi");

const addTeamSchema = Joi.object({
  teamName: Joi.string().required(),
  players: Joi.array()
    .items(
      Joi.object({
        name: Joi.string(),
      })
    )
    .length(11)
    .required(),
  captain: Joi.string().required(),
  viceCaptain: Joi.string().required(),
});

module.exports = {
  addTeamSchema,
};
