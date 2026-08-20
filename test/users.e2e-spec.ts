import request from 'supertest';
import { app } from './setup';
import { User } from '@app/database';
import { CreateUserDto, UpdateUserDto } from '@app/users';

describe('Users (e2e)', () => {
  it('should return an empty array', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('should return all users', async () => {
    await Promise.all([
      request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'user1@test.com',
          password: 'P@ssw0rd',
          confirmPassword: 'P@ssw0rd',
        })
        .expect(201),
      request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'user2@test.com',
          password: 'P@ssw0rd',
          confirmPassword: 'P@ssw0rd',
        })
        .expect(201),
    ]);

    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toHaveLength(2);
    const emails = response.body.map((user: User) => user.email);
    expect(emails).toEqual(
      expect.arrayContaining(['user1@test.com', 'user2@test.com']),
    );
  });

  it('should return 404 when user with the given ID is not found', async () => {
    await request(app.getHttpServer()).get('/users/1').expect(404);
  });

  it('should return a single user', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'user1@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/users/1')
      .expect(200);

    expect(response.body).toMatchObject({
      id: 1,
      email: 'user1@test.com',
    });
  });

  it('should return 400 BadRequestException when email is invalid', async () => {
    const dto: CreateUserDto = {
      email: 'inavlid-email',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        {
          path: ['email'],
          message: expect.stringContaining('Invalid'),
        },
      ],
    });
  });

  it('should return 400 when password and confirmPassword do not match', async () => {
    const dto: CreateUserDto = {
      email: 'valid@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd1',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        {
          path: ['confirmPassword'],
          message: expect.stringContaining('did not match'),
        },
      ],
    });
  });

  it('should return 400 when password does not contain 1 uppercase letter and 1 symbol', async () => {
    const dto: CreateUserDto = {
      email: 'valid@test.com',
      password: 'P@ssw0',
      confirmPassword: 'P@ssw0',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        {
          path: ['password'],
          message: expect.stringContaining('>=8'),
        },
      ],
    });
  });

  it('should throw 400 BadRequestException when password do not contain 1 uppercase and 1 symbol', async () => {
    const dto: CreateUserDto = {
      email: 'valid@test.com',
      password: 'passw0rd',
      confirmPassword: 'passw0rd',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        {
          code: 'custom',
          path: ['password'],
          message: expect.stringContaining('1 uppercase'),
        },
        {
          code: 'custom',
          path: ['password'],
          message: expect.stringContaining('1 symbol'),
        },
      ],
    });
  });

  it('should create and return a user', async () => {
    const dto: CreateUserDto = {
      email: 'valid@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      email: 'valid@test.com',
    });
  });

  it('should update existing user email and return a user with the updated email', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      })
      .expect(201);

    const { id } = body;

    const dto: UpdateUserDto = {
      email: 'updated@test.com',
    };

    const response = await request(app.getHttpServer())
      .patch(`/users/${id}`)
      .send(dto)
      .expect(200);

    expect(response.body).toMatchObject({
      id: id,
      email: 'updated@test.com',
    });
  });

  it('should update existing user password and can use that new password to signin', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      })
      .expect(201);

    const { id } = body;

    const dto: UpdateUserDto = {
      password: 'P@ssw0rd123',
    };

    const response = await request(app.getHttpServer())
      .patch(`/users/${id}`)
      .send(dto)
      .expect(200);

    expect(response.body).toMatchObject({
      id: id,
      email: 'test@test.com',
    });

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'test@test.com',
        password: 'P@ssw0rd',
      })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'test@test.com',
        password: 'P@ssw0rd123',
      })
      .expect(201);
  });

  it('should delete a user', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      })
      .expect(201);

    await request(app.getHttpServer()).delete('/users/1').expect(204);

    await request(app.getHttpServer()).get('/users/1').expect(404);
  });
});
