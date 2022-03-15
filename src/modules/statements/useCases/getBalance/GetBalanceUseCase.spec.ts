import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

let authenticateUser: IAuthenticateUserResponseDTO;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Balanço", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );

    await createUserUseCase.execute({
      name: "Marcelo",
      email: "123",
      password: "123",
    });

    authenticateUser = await authenticateUserUseCase.execute({
      email: "123",
      password: "123",
    });
  });

  it("Deve ser possível obter o balanco da conta do usuario", async () => {
    const operation: ICreateStatementDTO = {
      user_id: authenticateUser.user.id as string,
      amount: 500.0,
      description: "deposit",
      type: OperationType.DEPOSIT,
    };
    const operation2: ICreateStatementDTO = {
      user_id: authenticateUser.user.id as string,
      amount: 200.0,
      description: "withdraw",
      type: OperationType.WITHDRAW,
    };
    await createStatementUseCase.execute(operation);
    await createStatementUseCase.execute(operation2);

    const balance = await getBalanceUseCase.execute({
      user_id: authenticateUser.user.id as string,
    });

    expect(balance).toHaveProperty("statement");
    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toBe(300);
  });

  it("Deve ser possível obter o balanco da conta do usuario", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "authenticateUser.user.id as string",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
