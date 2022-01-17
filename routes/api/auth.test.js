const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");

describe("test auth", () => {
  let server;
  beforeAll(() => (server = app.listen(3000)));
  afterAll(() => server.close());

  beforeeach(() => {});

  test("test register route", async () => {
    const registerUser = {
      name: "Vlad",
      email: "vlad@mail.com",
      password: "123456",
    };
    const response = await request(app)
      .post("./api/auth/signup")
      .send(registerUser);
  });
});
