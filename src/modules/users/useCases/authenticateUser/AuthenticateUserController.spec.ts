import request from "supertest";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { createConnection } from "typeorm";

let connection: Connection;
describe("Authenticate Controller", () => {
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Deve realizar o login ", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "marcelo@admin.com.br",
      password: "admin",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  });

  it("Não deve realizar o login com senha incorreta", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "marcelo@admin.com.br",
      password: "errado",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  });

  it("Não deve realizar o login com o email inválido", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "errado",
      password: "admin",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  });
});
