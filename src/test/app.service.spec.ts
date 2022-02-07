
import { Test } from '@nestjs/testing'
import { HttpModule, HttpService } from '@nestjs/axios'
import { AppService } from '../app.service'
import { ItunesResult } from '../app.service'
import { Observable, of } from 'rxjs'
import axios, { AxiosResponse } from 'axios'
import { orderBy } from 'lodash'
import albums from './albums.fixture'

jest.mock("axios") // this is only needed for the 2nd test

describe('AppService', () => {
  let appService: AppService
  let httpService: HttpService

  const axiosResponse: AxiosResponse<ItunesResult, any> = {
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    data: {
      results: albums,
      resultCount: albums.length,
    }
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AppService],
    }).compile()

    appService = module.get<AppService>(AppService)
    httpService = module.get<HttpService>(HttpService)
  })

  describe('gets Albums', () => {
    it('should return a sorted array of Albums using Observable', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockImplementation((): Observable<AxiosResponse<ItunesResult, any>> => of(axiosResponse))

      appService
        .getAlbumsUsingObservable('Red+hot+chili+peppers')
        .subscribe((res) => expect(res).toEqual(orderBy(albums, 'releaseDate', 'desc')))
    })

    it('should return a sorted array of Albums using Axios', async () => {
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      mockedAxios.get.mockResolvedValueOnce(axiosResponse);

      const res = await appService.getAlbumsUsingAxios('Red+hot+chili+peppers')
      expect(res).toEqual(orderBy(albums, 'releaseDate', 'desc'))
    })

  })
})