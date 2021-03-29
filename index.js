const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Subject = require('./models/subject');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('./db/mongoose');
const userRouter = require('./routers/user');
const announcementRouter = require('./routers/announcement');
const subjectRouter = require('./routers/subject');
const courseRouter = require('./routers/course');
const fileRouter = require('./routers/file');
const testRouter = require('./routers/test');
const externalResourceRouter = require('./routers/externalresource');
const jobPostingRouter = require('./routers/jobposting');
const internshipRouter = require('./routers/internship');
const manageUsersRouter = require('./routers/manageusers');
const resumeRouter = require('./routers/resume');

const app = express();
app.use(helmet());
const port = process.env.PORT;

app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(
  session({
    secret: 'secretcode',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 10800000 },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
require('./middleware/passport')(passport);

//initial database setup
User.findOne({ email: process.env.ADMIN_ID }, async (err, doc) => {
  if (err) throw err;
  if (doc) {
  }
  if (!doc) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    newUser = new User({
      email: process.env.ADMIN_ID,
      password: hashedPassword,
      role: 'admin',
    });
    await newUser.save();
    console.log('admin user created');
  }
});

Subject.findOne({ _id: '5f9887f1a71e98361c68da85' }, async (err, doc) => {
  if (err) throw err;
  if (doc) {
  }
  if (!doc) {
    newSubject = new Subject({
      _id: '5f9887f1a71e98361c68da85',
      title: 'General',
    });
    await newSubject.save();
    console.log('subject created');
  }
});

app.use('/user', userRouter);
app.use('/announcement', announcementRouter);
app.use('/subject', subjectRouter);
app.use('/course', courseRouter);
app.use('/file', fileRouter);
app.use('/test', testRouter);
app.use('/externalresource', externalResourceRouter);
app.use('/jobposting', jobPostingRouter);
app.use('/internship', internshipRouter);
app.use('/manageusers', manageUsersRouter);
app.use('/resume', resumeRouter);

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
