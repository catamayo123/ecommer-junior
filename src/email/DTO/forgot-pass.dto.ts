import { IsEmail } from "class-validator";

export class ForgotPassDTO {
  @IsEmail({}, {message: 'Email no valido'})
  email!: string 
}
