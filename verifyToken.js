const jwt = require("jsonwebtoken");

//403-Forbidden
function verify(req, res, next) {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, userInfo) => {
      if (err) {
        return res.status(403).json("Invalid token!");
      }
      req.user = userInfo;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
}

module.exports = verify;
