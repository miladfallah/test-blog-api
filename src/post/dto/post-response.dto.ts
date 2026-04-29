import { Expose, Type } from 'class-transformer';

class AuthorDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;
}

export class PostResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  content: string;

  @Expose()
  published: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => AuthorDto)
  author: AuthorDto;
}
