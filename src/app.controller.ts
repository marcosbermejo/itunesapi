import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { AlbumDto } from './album.dto'
import { serialize } from './app.serializer';
import { ApiResponse } from '@nestjs/swagger';

@Controller('music')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':artist')
  @ApiResponse({
    status: 200,
    description: 'Albums for a given artist',
  })  
  getAlbumsUsingObservable(@Param('artist') artist: string): Observable<AlbumDto[]> {
    return (
      this
        .appService
        .getAlbumsUsingObservable(artist)
        .pipe(map(albums => albums.map(album => serialize(AlbumDto, album))))
    )
  }

  @Get('axios/:artist')
  async getAlbumsUsingAxios(@Param('artist') artist: string): Promise<AlbumDto[]> {
    const albums = await this.appService.getAlbumsUsingAxios(artist)
    return albums.map(album => serialize(AlbumDto, album))
  }
}
