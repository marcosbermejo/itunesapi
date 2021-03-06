# Description
iTunes search API using NestJS.

## Installation

```bash
$ npm install
```

## Running the API

```bash
$ npm run start
```

## Test

```bash
$ npm run test
```

# Explanations and Justifications

## Why NestJS

It's the best NodeJS framework in my opinion. Great documentation, native support for Typescript, scalable and testable.

## Main functionality

There are 2 endpoints for the same functionality (get albums by artist) but with different implementations:

- Using NestJS [HttpModule](https://docs.nestjs.com/techniques/http-module)
- Using axios directly

### Using HttpModule

[http://localhost:3000/music/:artist](http://localhost:3000/music/red%20hot%20chili%20peppers)

This is the endpoint that the frontend uses. It is implemented using Observable. It is easier to test because it uses `httpService` from `@nestjs/axios`. Just mocking the service is enough to make it work.

```ts
// ./src/test/app.service.spec.ts
jest
  .spyOn(httpService, 'get')
  .mockImplementation((): Observable<AxiosResponse<ItunesResult, any>> => of(axiosResponse))
```

The drawback is all the rxjs management with Observables. I personally find this a bit tedious

```ts
// ./src/app.service.ts
return response.pipe(
  map(response => {
    return uniqBy(response.data.results, 'collectionName')
  }),
  map(albums => {
    return orderBy(albums, 'releaseDate', 'desc')
  }),
  catchError(e => {
    throw new HttpException(e.response.data, e.response.status)
  }),
)
```
### Using axios directly

[http://localhost:3000/music/axios/:artist](http://localhost:3000/music/red%20hot%20chili%20peppers)

This endpoint is not used by the frontend but it is also tested in the same way as the previous endpoint.

Importing axios in `app.service.ts` is easier, and I am more used to work with promises and async/await rather than with Observables.

```ts
// ./src/app.service.ts
const response = await axios.get<ItunesResult>(url)
```

The drawback here is it has bad testability. In the test we should mock all axios using this:

```ts
// ./src/test/app.service.spec.ts
jest.mock("axios")
```

And then:

```ts
// ./src/test/app.service.spec.ts
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockResolvedValueOnce(axiosResponse);
```

It can become tricky and difficult to mantain very fast.

## Usage of DTO

It is highly recommended to use Data Transfer Objects to make the communication between the backend and the frontend more scalable.

In this exercice I have decided to use a DTO with 2 parameters:

```ts
// ./src/album.dto.ts
import { Expose } from 'class-transformer'

export class AlbumDto {
  @Expose({ name: 'collectionName' })
  name: string

  @Expose({ name: 'artworkUrl100' })
  image: string
}
```

Using `class-transformer` dependency is very useful to automatically transform data from the Entity (database or iTunes API or any other source) to the DTO.

In this example @Expose allows me to transform the property name from `collectionName` (used internally) to `name` (used externally).

Using `class-validator` is also useful to validate DTOs in the body request (for instance, POST request to create a User) like in this example:

```ts
import { IsEmail, Length } from 'class-validator'

export class ExampleDto {
  @Length(2, 50)
  name: string

  @IsEmail()
  email: string
}
```

In my opinion, usage of DTO's should stay in the controller layer. Services should not depend on DTO's. DTO's are only intended for backend - frontend communication. They should not interfere with the domain model.

This separation of concerns enhances scalability and robustness.

Finally, the `app.serializer.ts` file contains the code for transforming from `Album` to `AlbumDTO`. Therefore, it can be used from any controller.

## Swagger

NestJS also makes it easy to configure Swagger endpoint. You can test it in this url: http://localhost:3000/api/

It is not fully configured in this project yet, just initialized.

