import { IsString, MaxLength, MinLength } from "class-validator"

export class ChangePasswordDTO {

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    currentPass!: string

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    newPass!: string
}