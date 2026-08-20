import request from 'supertest';
import { SigninDto, SignupDto } from '@app/auth/auth.dto';
import { app } from './setup';

describe('Authentication (e2e)', () => {
  it('should return 400 when email is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'invalid-email',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        {
          path: ['email'],
          message: 'Invalid email address',
        },
      ],
    });
  });

  it('should return 400 when password is less than 8 characters', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'test@test.com',
        password: 'P@ssw0',
        confirmPassword: 'P@ssw0',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        {
          path: ['password'],
          message: expect.stringContaining('small'),
        },
      ],
    });
  });

  it('should return 400 when password and confirmPassword did not match', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'test@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd1',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        {
          path: ['confirmPassword'],
          message: 'Password did not match',
        },
      ],
    });
  });

  it('handles a signup request', async () => {
    const dto = {
      email: 'demo1@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(dto)
      .expect(201);

    const { id, email } = response.body;
    expect(id).toBeDefined();
    expect(email).toEqual(dto.email);
  });

  it('should return a 409 ConflictException', async () => {
    const dto: SignupDto = {
      email: 'demo@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(dto)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(dto)
      .expect(409);
  });

  it('handles a signin request', async () => {
    const signupDto: SignupDto = {
      email: 'demo@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    const signinDto: SigninDto = {
      email: 'demo@test.com',
      password: 'P@ssw0rd',
    };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signupDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(signinDto)
      .expect(201);

    const { email } = response.body;

    expect(email).toEqual(signinDto.email);
  });

  it('should return 401 UnauthorizedException', async () => {
    const siginDto: SigninDto = {
      email: 'test@test.com',
      password: 'P@ssw0rd',
    };

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send(siginDto)
      .expect(401);
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const signupDto: SignupDto = {
      email: 'demo@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    // agent keeps the cookie/session between request
    const agent = request.agent(app.getHttpServer());

    await agent.post('/auth/signup').send(signupDto).expect(201);

    const response = await agent.get('/auth/whoami').expect(200);
    const { email } = response.body;

    expect(email).toEqual(signupDto.email);
  });

  it('should return a 403 if not authenticated and tried to access whoami', async () => {
    await request(app.getHttpServer()).get('/auth/whoami').expect(403);
  });

  it('should logout', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/signup')
      .send({
        email: 'test@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      })
      .expect(201);

    await agent.post('/auth/signout').expect(204);

    await agent.get('/auth/whoami').expect(403);
  });
});
