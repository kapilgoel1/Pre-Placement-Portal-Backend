const request = require('supertest');
const app = require('../app');
const appp = request.agent(app);

// const User = require('../models/user');
// const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

// beforeEach(setupDatabase)

test('Should signup a new user', async () => {
  const response = await appp
    .post('/user/register')
    .send({
      email: 'twinkles@gmail.com',
      password: 'inked',
      firstname: 'twinkle',
      lastname: 'star',
      phone: '823972202',
      role: 'faculty',
    })
    .expect(200);

  expect(response.body).toBe('successful');

  // Assert that the database was changed correctly
  // const user = await User.findById(response.body.user._id)
  // expect(user).not.toBeNull()

  // // Assertions about the response
  // expect(response.body).toMatchObject({
  //     user: {
  //         name: 'Andrew',
  //         email: 'andrew@example.com'
  //     },
  //     token: user.tokens[0].token
  // })
  // expect(user.password).not.toBe('MyPass777!')
});

test('Should login a user', async () => {
  const response = await appp
    .post('/user/login')
    .send({
      email: 'twinkles@gmail.com',
      password: 'inked',
    })
    .expect(200);
});

test('Should get logged in user details', async () => {
  const response = await appp.get('/user/details').send().expect(200);

  expect(response.body).toHaveProperty('email');
});
