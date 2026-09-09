import { IsEmail, IsString, Length, MaxLength, MinLength } from "class-validator";

export class ResetPassDTO {
  @IsEmail({}, {message: 'Email no valido'})
  email!: string 
  
  @IsString()
  @Length(4, 4, {message: 'El codigo debe de tener 4 digitos'})
  code!:  string

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  newPass!: string
}
