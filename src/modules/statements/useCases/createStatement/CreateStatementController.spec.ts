import request from "supertest";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { createConnection } from "typeorm";

let connection: Connection;

let responseAuthenticate: any;
describe("Create Statement", () => {
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

  it("should make a deposit to the user's account", async () => {
    const token = responseAuthenticate.body.token;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .auth(token, { type: "bearer" })
      .send({
        amount: 300,
        description: "deposit",
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(300);
  });

  it("should make a withdraw to the user's account", async () => {
    const token = responseAuthenticate.body.token;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .auth(token, { type: "bearer" })
      .send({
        amount: 300,
        description: "withdraw",
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(300);
  });

  it("should not make withdrawals greater than the available balance", async () => {
    const token = responseAuthenticate.body.token;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .auth(token, { type: "bearer" })
      .send({
        amount: 300,
        description: "withdraw",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient funds");
  });
});
