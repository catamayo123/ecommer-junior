import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
// se coloca a parte por si en algun momento se desea agg algo aqui que no este en createDTO