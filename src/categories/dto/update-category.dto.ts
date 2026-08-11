import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDTO } from './create-category.dto';

export class UpdateCategoryDTO extends PartialType(CreateCategoryDTO) {}
// se coloca a parte por si en algun momento se desea agg algo aqui que no este en createDTO
