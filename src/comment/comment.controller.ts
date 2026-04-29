import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(req.user.id, postId, createCommentDto);
  }

  @Get('posts/:postId/comments')
  async findAllByPost(@Param('postId') postId: string) {
    return this.commentService.findAllByPost(postId);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: string) {
    return this.commentService.delete(id, req.user.id, req.user.role);
  }
}
