import { instanceToPlain, plainToInstance, ClassConstructor } from 'class-transformer'

export function serialize<T, P> (cls: ClassConstructor<T>, p: P): T {
  return plainToInstance(cls, instanceToPlain(p), {excludeExtraneousValues: true})
}