import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🚀 Blog API is running! Visit /api/posts for public posts.';
  }
}
