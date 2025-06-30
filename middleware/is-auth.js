/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).redirect("/login");
  }
  next();
};
