import request from "supertest";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { createConnection } from "typeorm";

let connection: Connection;
describe("Perfil Usuário", () => {
  beforeEach(async () => {
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

  it("Deve retornar o perfil do usuário logado ", async () => {
    const responseAuthenticate = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "marcelo@admin.com.br",
        password: "admin",
      });

    const token = responseAuthenticate.body.token;

    const response = await request(app)
      .get("/api/v1/profile")
      .auth(token, { type: "bearer" });
    // .set({
    //   Authorization: `Bearer ${token}`,
    // });

    expect(response.status).toBe(200);
  });
});
