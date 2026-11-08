import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUsersDto {
    @IsNotEmpty({ message: "Nama harus diisi" })
    @IsString({ message: "Nama harus berupa teks" })
    @MaxLength(100, { message: "Nama maksimal 100 karakter" })
    readonly name: string;

    @IsNotEmpty({ message: "Email harus diisi" })
    @IsEmail({}, { message: "Format email tidak valid" })
    @MaxLength(100, { message: "Email maksimal 100 karakter" })
    readonly email: string;

    @IsNotEmpty({ message: "Password harus diisi" })
    @IsString({ message: "Password harus berupa teks" })
    @MinLength(6, { message: "Password minimal 6 karakter" })
    readonly password: string;
}