import { Expose } from 'class-transformer'

export class AlbumDto {
  @Expose({ name: 'collectionName' })
  name: string

  @Expose({ name: 'artworkUrl100' })
  image: string
}