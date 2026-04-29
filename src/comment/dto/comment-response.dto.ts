import { Expose, Type } from 'class-transformer';

class CommentAuthorDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;
}

export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => CommentAuthorDto)
  author: CommentAuthorDto;
}
