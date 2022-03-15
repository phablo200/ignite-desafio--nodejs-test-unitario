import request from "supertest";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { createConnection } from "typeorm";

let connection: Connection;

let responseAuthenticate: any;
describe("Get Statement Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
      values('${id}', 'Marcelo', 'marcelo@admin.com.br', '${password}', 'now()', 'now()')
    `
    );

    responseAuthenticate = await request(app).post("/api/v1/sessions").send({
      email: "marcelo@admin.com.br",
      password: "admin",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should return an operation", async () => {
    const token = responseAuthenticate.body.token;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .auth(token, { type: "bearer" })
      .send({
        amount: 300,
        description: "deposit",
      });

    const response = await request(app)
      .get(`/api/v1/statements/${responseStatement.body.id}`)
      .auth(token, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("user_id");
  });
});
