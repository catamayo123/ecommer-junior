import { IsString, MaxLength, MinLength } from "class-validator"

export class ChangePasswordDto {

    @IsString()
    @MinLength(8)
    @MaxLength(50)
    currentPass!: string

    @IsString()
    @MinLength(8)
    @MaxLength(50)
    newPass!: string
}