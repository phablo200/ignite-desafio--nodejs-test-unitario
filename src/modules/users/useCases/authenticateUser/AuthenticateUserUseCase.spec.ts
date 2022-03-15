import { response } from "express";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
describe("Authenticate", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("Deve autenticar o usuário", async () => {
    await createUserUseCase.execute({
      name: "Marcelo",
      email: "123",
      password: "123",
    });

    const authenticateUser = await authenticateUserUseCase.execute({
      email: "123",
      password: "123",
    });

    expect(authenticateUser).toHaveProperty("user");
    expect(authenticateUser).toHaveProperty("token");
    expect(response.statusCode).toBe(200);
  });

  it("Não deve se autenticar com email errado", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Marcelo",
        email: "1234",
        password: "1234",
      });

      await authenticateUserUseCase.execute({
        email: "123kk",
        password: "123",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Não deve se autenticar com senha errada", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Marcelo",
        email: "12345",
        password: "12345",
      });

      await authenticateUserUseCase.execute({
        email: "123",
        password: "123ooo",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
