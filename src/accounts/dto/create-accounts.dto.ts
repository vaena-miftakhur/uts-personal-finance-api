import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class CreateAccountsDto {
    @IsNotEmpty({ message: "User ID harus diisi" })
    @IsUUID("4", { message: "User ID harus berupa UUID" })
    readonly user_id: string;

    @IsNotEmpty({ message: "Nama akun harus diisi" })
    @IsString({ message: "Nama akun harus berupa teks" })
    @MaxLength(100, { message: "Nama akun maksimal 100 karakter" })
    readonly name: string;

    @IsNotEmpty({ message: "Jenis akun harus diisi" })
    @IsIn(["cash", "bank", "e-wallet"], { message: "Jenis akun harus cash, bank, atau e-wallet" })
    readonly type: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "Saldo harus berupa angka (maks 2 desimal)" })
    @Min(0, { message: "Saldo tidak boleh negatif" })
    readonly balance?: number;
}