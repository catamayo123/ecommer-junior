import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export class AddItemDTO {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
