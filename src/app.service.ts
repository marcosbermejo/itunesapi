import { BadRequestException, Injectable, HttpException } from '@nestjs/common'
import { URLSearchParams } from 'url'
import { HttpService } from '@nestjs/axios'
import { Observable } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { uniqBy, orderBy } from 'lodash'
import axios from 'axios'

const ITUNES_URL = 'https://itunes.apple.com/search'

const params = {
  media: 'music',
  entity: 'album',
  attribute: 'artistTerm',
  limit: '200',
}

export interface ItunesResult {
  readonly resultCount: number
  readonly results: Array<Album>
}

export interface Album {
  collectionName: string
  artworkUrl100: string
  releaseDate: string
}

@Injectable()
export class AppService {

  constructor (private httpService: HttpService) {}

  getAlbumsUsingObservable (term: string): Observable<Album[]> {

    const url = `${ITUNES_URL}?${new URLSearchParams({...params, term}).toString()}`
    const response = this.httpService.get<ItunesResult>(url)
   
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
  }

  async getAlbumsUsingAxios (term: string): Promise<Album[]> {
    let albums:Album[] = []

    const url = `${ITUNES_URL}?${new URLSearchParams({...params, term}).toString()}`

    try {
      const response = await axios.get<ItunesResult>(url)
      albums = uniqBy(response.data.results, 'collectionName')
      albums = orderBy(albums, 'releaseDate', 'desc')
      return albums

    } catch (error) {
      throw new BadRequestException('Error fetching data')
    } 
  }
}
