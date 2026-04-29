import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Role } from '../common/enums/role.enum';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-') +
      '-' +
      Date.now()
    );
  }

  async create(userId: string, createPostDto: CreatePostDto) {
    const slug = this.generateSlug(createPostDto.title);

    const existingPost = await this.prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      throw new ConflictException('Slug already exists');
    }

    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        slug,
        content: createPostDto.content,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return post;
  }

  async findAllPublished(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const whereCondition: any = { published: true };

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, fullName: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      this.prisma.post.count({ where: whereCondition }),
    ]);

    return {
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, fullName: true, email: true },
        },
        comments: {
          where: { post: { slug } },
          include: {
            author: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    updatePostDto: UpdatePostDto,
  ) {
    const post = await this.findById(id);

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updateData: any = {};
    if (updatePostDto.title) {
      updateData.title = updatePostDto.title;
      updateData.slug = this.generateSlug(updatePostDto.title);
    }
    if (updatePostDto.content) updateData.content = updatePostDto.content;

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return updatedPost;
  }

  async delete(id: string, userId: string, userRole: string) {
    const post = await this.findById(id);

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({ where: { id } });

    return { message: 'Post deleted successfully' };
  }

  async togglePublish(id: string) {
    const post = await this.findById(id);

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: { published: !post.published },
    });

    return {
      message: `Post ${updatedPost.published ? 'published' : 'unpublished'} successfully`,
      published: updatedPost.published,
    };
  }
}
