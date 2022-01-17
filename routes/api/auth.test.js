const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../../app");
const { User } = require("../../model/user");

require("dotenv").config();

const { DB_TEST_HOST } = process.env;

describe("test auth", () => {
  let server;
  beforeAll(() => (server = app.listen(3000)));
  afterAll(() => server.close());

  beforeEach((done) => {
    mongoose.connect(DB_TEST_HOST).then(() => done());
  });

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(() => done());
    });
  });

  test("test register route", async () => {
    const registerUser = {
      name: "Vlad",
      email: "vlad@mail.com",
      password: "123456",
    };
    const response = await request(app)
      .post("./api/auth/signup")
      .send(registerUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Register success");

    const user = await User.findByIdAndUpdate(response.body._id);
    expect(user).toByThruthy();
    expect(user.name).toBe(registerUser.name);
    expect(user.email).toBe(registerUser.email);
  });
});
