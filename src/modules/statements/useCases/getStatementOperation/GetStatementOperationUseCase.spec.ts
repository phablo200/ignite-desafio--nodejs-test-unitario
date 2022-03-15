import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
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

  it("Deve ser possível obter a operacao", async () => {
    const operation: ICreateStatementDTO = {
      user_id: authenticateUser.user.id as string,
      amount: 500.0,
      description: "deposit",
      type: OperationType.DEPOSIT,
    };

    const deposit = await createStatementUseCase.execute(operation);

    const depositId = deposit.id;

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: authenticateUser.user.id as string,
      statement_id: depositId as string,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toHaveProperty("amount");
    expect(statementOperation).toHaveProperty("type");
    expect(statementOperation.amount).toBe(500);
  });

  it(" Não Deve ser possível obter a operecao com id da operacao incorreto", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: authenticateUser.user.id as string,
        statement_id: "id incorreto",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it(" Não Deve ser possível obter a operecao com id do usuario incorreto", async () => {
    expect(async () => {
      const operation: ICreateStatementDTO = {
        user_id: authenticateUser.user.id as string,
        amount: 500.0,
        description: "deposit",
        type: OperationType.DEPOSIT,
      };

      const deposit = await createStatementUseCase.execute(operation);

      const depositId = deposit.id;

      await getStatementOperationUseCase.execute({
        user_id: "id incorreto",
        statement_id: depositId as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
