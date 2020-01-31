const request = require("supertest");
const db = require("../database/dbConfig.js");
const server = require("../api/server.js");

describe("auth-route", function() {
  describe("POST /register", function() {
    beforeEach(async () => {
      await db("users").truncate();
    });
    it("should return a new user as json object", function() {
      return request(server)
        .post("/api/auth/register")
        .send({
          username: "mike",
          password: "test"
        })
        .then(res => {
          expect(res.type).toMatch(/json/i);
        });
    });
    it("should have 201 status if successful", function() {
      return request(server)
        .post("/api/auth/register")
        .send({
          username: "lyra",
          password: "test"
        })
        .then(res => {
          expect(res.status).toBe(201);
        });
    });
  });

  describe("POST /login", function() {
    it("should return a token in the form of a json object", function() {
      return request(server)
        .post("/api/auth/login")
        .send({
          username: "lyra",
          password: "test"
        })
        .then(res => {
          expect(res.body).toHaveProperty("token");
        });
    });
    // it("should have a 200 status if successful", function() {
    //   return request(server)
    //     .post("/api/auth/login")
    //     .auth("lyra", "test")
    //     .then(res => {
    //       expect(res.status).toBe(200);
    //     });
    // });
  });
});

let token;

beforeAll(done => {
  request(server)
    .post("/api/auth/login")
    .send({ username: "lyra", password: "test" })
    .end((err, res) => {
      token = res.body.token;
      done();
    });
});

describe("jokes-route", function() {
  describe("GET /", function() {
    it("requires authorization", function() {
      return request(server)
        .get("/api/jokes/")
        .then(res => {
          expect(res.status).toBe(401);
        });
    });
    it("returns an array of joke objects", function() {
      return request(server)
        .get("/api/jokes/")

        .auth("lyra", "test")
        .set("Authorization", token)
        .then(res => {
          expect(res.body).toContainEqual({
            id: "0189hNRf2g",
            joke:
              "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
          });
        });
    });
    it("returns with status 200 if successful", function() {
      return request(server)
        .get("/api/jokes/")
        .auth("lyra", "test")
        .set("Authorization", token)
        .then(res => {
          expect(res.status).toBe(200);
        });
    });
  });
});
