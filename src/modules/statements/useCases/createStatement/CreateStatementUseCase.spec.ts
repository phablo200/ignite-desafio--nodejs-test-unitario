import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: InMemoryStatementsRepository;

let authenticateUser: IAuthenticateUserResponseDTO;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Operações Bancárias", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
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

  it("Deve ser possível criar um deposito na conta do usuário", async () => {
    const operation: ICreateStatementDTO = {
      user_id: authenticateUser.user.id as string,
      amount: 500.0,
      description: "deposit",
      type: OperationType.DEPOSIT,
    };
    const deposit = await createStatementUseCase.execute(operation);

    expect(deposit).toHaveProperty("id");
    expect(deposit).toHaveProperty("amount");
    expect(deposit).toHaveProperty("user_id");
  });

  it("Deve ser possível realizer um saque na conta do usuário", async () => {
    const operation: ICreateStatementDTO = {
      user_id: authenticateUser.user.id as string,
      amount: 400.0,
      description: "withdraw",
      type: OperationType.WITHDRAW,
    };
    const withdraw = await createStatementUseCase.execute(operation);

    expect(withdraw).toHaveProperty("id");
    expect(withdraw).toHaveProperty("amount");
    expect(withdraw).toHaveProperty("user_id");
  });

  it("Não deve ser possível realizar um saque maior que o saldo da conta do usuário", async () => {
    expect(async () => {
      const operation: ICreateStatementDTO = {
        user_id: authenticateUser.user.id as string,
        amount: 200.0,
        description: "withdraw",
        type: OperationType.WITHDRAW,
      };
      await createStatementUseCase.execute(operation);
    }).rejects.toBeInstanceOf(AppError);
  });
});
