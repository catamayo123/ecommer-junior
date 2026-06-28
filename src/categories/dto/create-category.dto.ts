import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

/*
  El ? en TypeScript + @IsOptional() en class-validator trabajan juntos:

  ? → TypeScript permite que no esté esa caracteristica presente en el objeto
  @IsOptional() → class-validator no lanza error si falta
*/