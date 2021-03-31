function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(400).json("not authenticated");
}

function isFaculty(req, res, next) {
  if (req.user.role === "faculty") {
    next();
  } else {
    res.send("you are not faculty");
  }
}

function isStudent(req, res, next) {
  if (req.user.role === "student") {
    next();
  } else {
    res.send("you are not student");
  }
}

function isAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.send("you are not admin");
  }
}

module.exports = {
  isAuthenticated,
  isFaculty,
  isStudent,
  isAdmin,
};
