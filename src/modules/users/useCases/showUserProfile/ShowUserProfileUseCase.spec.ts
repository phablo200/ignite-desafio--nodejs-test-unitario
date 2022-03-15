import { request } from "express";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUserUseCase: ShowUserProfileUseCase;
let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Listar Usuário Logado", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUserUseCase = new ShowUserProfileUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Deve ser possível retornar o usuario logado", async () => {
    const user = {
      name: "Marcelo",
      email: "123",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const authenticateUser = await authenticateUserUseCase.execute({
      email: "123",
      password: "123",
    });

    const listUser = await showUserProfileUserUseCase.execute(
      authenticateUser.user.id as string
    );

    expect(listUser).toHaveProperty("id");
    expect(listUser).toHaveProperty("email");
    expect(listUser).toHaveProperty("name");
  });
});
