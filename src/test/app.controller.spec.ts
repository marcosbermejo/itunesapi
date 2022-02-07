
import { Test } from '@nestjs/testing'
import { HttpModule } from '@nestjs/axios'
import { AppController } from '../app.controller'
import { AppService } from '../app.service'
import { Album } from '../app.service'
import { Observable, of } from 'rxjs'
import { AlbumDto } from '../album.dto'
import albums from './albums.fixture'
import { orderBy } from 'lodash'

// sorted by releaseDate DESC
const result: AlbumDto[] = [
  { name: 'Stadium Arcadium', image: 'test.jpg' },
  { name: 'By The Way', image: 'test.jpg' },
  { name: 'Californication', image: 'test.jpg' }
]

describe('AppController', () => {
  let appController: AppController
  let appService: AppService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    appService = module.get<AppService>(AppService)
    appController = module.get<AppController>(AppController)
  })

  describe('gets Albums', () => {
    it('should return an array of Album using Observable', async () => {
      jest
        .spyOn(appService, 'getAlbumsUsingObservable')
        .mockImplementation((): Observable<Album[]> => of(orderBy(albums, 'releaseDate', 'desc')))

      appController
        .getAlbumsUsingObservable('Red+hot+chili+peppers')
        .subscribe((res) => expect(res).toEqual(result))
    })

    it('should return an array of Album using Axios', async () => {
      jest
        .spyOn(appService, 'getAlbumsUsingAxios')
        .mockImplementation(async (): Promise<Album[]> => orderBy(albums, 'releaseDate', 'desc'))

      const response = await appController.getAlbumsUsingAxios('Red+hot+chili+peppers')
      expect(response).toEqual(result)
    })

  })
})