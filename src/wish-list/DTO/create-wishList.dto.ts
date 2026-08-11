import { IsUUID } from "class-validator";

export class CreateWhishListDTO{
    @IsUUID()
	productId!: string
}