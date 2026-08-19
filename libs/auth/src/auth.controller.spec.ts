import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './auth.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should signup', async () => {
    const dto: SignupDto = {
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'password',
    };

    authServiceMock.signUp.mockResolvedValue({ id: 1 });

    const session: Record<string, any> = {};
    const result = await controller.signUp(session, dto);

    expect(authServiceMock.signUp).toHaveBeenCalledWith(dto);
    expect(session.userId).toBe(1);
    expect(result).toEqual({
      id: 1,
    });
  });

  it('should sigin', async () => {
    const dto: SigninDto = {
      email: 'test@test.com',
      password: 'password',
    };

    authServiceMock.signIn.mockResolvedValue({ id: 1 });
    const session: Record<string, any> = {};
    const result = await controller.sigIn(session, dto);

    expect(authServiceMock.signIn).toHaveBeenCalledWith(dto);
    expect(session.userId).toBe(1);
    expect(result).toEqual({
      id: 1,
    });
  });

  it('should return the current user', async () => {
    const currentUser = {
      id: 1,
      email: 'test@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(controller.whoAmI(currentUser)).toEqual(currentUser);
  });
});
