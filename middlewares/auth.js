const authHeaderValue =
  "Basic " + Buffer.from(process.env.BASIC_AUTH).toString("base64");

function basicAuth(req, res, next) {
  if (req.headers.authorization !== authHeaderValue) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).send("Unauthorized");
  }
  next();
}

module.exports = { basicAuth };
