const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { jwtSecret } = require("../config/secrets.js");

const Users = require("./auth-model.js");

router.post("/register", (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 12);
  user.password = hash;

  Users.add(user)
    .then(savedUser => {
      res.status(201).json(savedUser);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: "internal error" });
    });
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = youveGotToken(user);

        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: "you ain't got the creds" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "internal error" });
    });
});

function youveGotToken(user) {
  const payload = {
    sub: user.id
  };

  const options = {
    expiresIn: "8h"
  };

  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;
