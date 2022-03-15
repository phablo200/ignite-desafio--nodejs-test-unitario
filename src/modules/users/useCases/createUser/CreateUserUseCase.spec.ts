import { response } from "express";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;
describe("Create User", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be to create a new user", async () => {
    const user = {
      name: "Marcelo",
      email: "123",
      password: "123",
    };

    const createUser = await createUserUseCase.execute(user);

    expect(createUser).toHaveProperty("id");
    expect(createUser).toHaveProperty("email");
    expect(response.statusCode).toBe(200);
  });

  it("should not be able to create a new user with an email already registered", async () => {
    expect(async () => {
      const user = {
        name: "Marcelo",
        email: "123",
        password: "123",
      };

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });
});
