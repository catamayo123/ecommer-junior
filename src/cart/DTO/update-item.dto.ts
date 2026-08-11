import { IsInt, Min } from 'class-validator';

export class UpdateItemDTO {
  @IsInt()
  @Min(1)
  quantity!: number;
}
