import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import { createConnection } from "typeorm";

let connection: Connection;
describe("Create Category Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Deve ser criado um novo usuario ", async () => {
    const responseUser = await request(app).post("/api/v1/users").send({
      email: "teste2@teste.com",
      password: "123",
      name: "MarceloSuperteste",
    });

    expect(responseUser.status).toBe(201);
  });
  it("Não Deve ser criado um novo usuario com o mesmo email ", async () => {
    const responseUser = await request(app).post("/api/v1/users").send({
      email: "teste2@teste.com",
      password: "123",
      name: "MarceloSuperteste",
    });

    expect(responseUser.status).toBe(400);
  });
});
