import request from "supertest";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { createConnection } from "typeorm";

let connection: Connection;

let responseAuthenticate: any;
describe("Get Balance", () => {
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

  it("should receive the balance", async () => {
    const token = responseAuthenticate.body.token;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .auth(token, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toBe(0);
  });
});
