import request from 'supertest';
import { SigninDto, SignupDto } from '@app/auth/auth.dto';
import { app } from './setup';

describe('Authentication (e2e)', () => {
  it('handles a signup request', async () => {
    const dto = {
      email: 'demo1@test.com',
      password: 'password',
      confirmPassword: 'password',
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
      password: 'password',
      confirmPassword: 'password',
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
      password: 'password',
      confirmPassword: 'password',
    };

    const signinDto: SigninDto = {
      email: 'demo@test.com',
      password: 'password',
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
      password: 'password',
    };

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send(siginDto)
      .expect(401);
  });
});
