import { IsArray, IsIn, IsOptional, IsUUID } from 'class-validator';

export class UpdateUserAccessDto {
  @IsOptional()
  @IsIn(['active', 'suspended', 'deleted'])
  status?: 'active' | 'suspended' | 'deleted';

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}
