import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateProfileDTO {
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    name?: string

    @IsOptional()
    @IsEmail()
    email?: string

    // se utiliza solo si se va a cambiar el email
    @IsString()
    @IsOptional()
    currentPass?: string
}