import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    postId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        authorId: userId,
        postId,
      },
      include: {
        author: {
          select: { id: true, fullName: true },
        },
      },
    });

    return comment;
  }

  async findAllByPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  async findById(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async delete(id: string, userId: string, userRole: string) {
    const comment = await this.findById(id);

    if (comment.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id } });

    return { message: 'Comment deleted successfully' };
  }
}
