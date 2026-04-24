import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository, UserFilters } from './users.repository';
import { CreateUserDto, UpdateUserDto } from './dto';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async listUsers(filters?: UserFilters) {
    const usersList = await this.usersRepository.findAll(filters);
    return usersList.map(({ passwordHash, ...user }) => user);
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersRepository.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
      userType: dto.userType,
      regionId: dto.regionId,
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updateData: Record<string, unknown> = {};

    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.userType !== undefined) updateData.userType = dto.userType;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.regionId !== undefined) updateData.regionId = dto.regionId;

    if (dto.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(
        dto.password,
        BCRYPT_SALT_ROUNDS,
      );
    }

    const updated = await this.usersRepository.update(id, updateData as any);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const { passwordHash, ...result } = updated;
    return result;
  }
}
