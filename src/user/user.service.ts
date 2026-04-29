import { Injectable } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from 'prisma/prisma.service';

// تعریف type محلی برای User
export type UserWithoutPassword = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.excludePassword(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateRole(userId: string, role: Role): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return this.excludePassword(user);
  }

  excludePassword(user: any): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  }
}
