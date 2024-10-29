const Validations = require("./schema");

module.exports = function (validator) {
  if (!Validations.hasOwnProperty(validator))
    return new Error(`'${validator}' validator is not exist`);

  return async function (req, res, next) {
    try {
      // We can add validation for req.query and req.params too here.
      // We only hvae one routes that require validation from  req body.
      const validated = await Validations[validator].validateAsync(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err.isJoi) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }
      return res.status(400).json({
        success: false,
        error: "Error while validating request.",
      });
    }
  };
};
