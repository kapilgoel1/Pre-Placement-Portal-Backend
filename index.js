const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('./db/mongoose');
const userRouter = require('./routers/user');
const announcementRouter = require('./routers/announcement');
const subjectRouter = require('./routers/subject');
const fileRouter = require('./routers/file');
const testRouter = require('./routers/test');
const externalResourceRouter = require('./routers/externalresource');
const jobPostingRouter = require('./routers/jobposting')

const app = express();
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

app.use('/user', userRouter);
app.use('/announcement', announcementRouter);
app.use('/subject', subjectRouter);
app.use('/file', fileRouter);
app.use('/test', testRouter);
app.use('/externalresource', externalResourceRouter);
app.use('/jobposting', jobPostingRouter)

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
