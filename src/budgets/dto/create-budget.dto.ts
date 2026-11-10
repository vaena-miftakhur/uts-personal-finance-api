import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateBudgetDto{
    @IsNotEmpty({ message: "User ID harus diisi" })
    @IsString()
    readonly userId: string;

    @IsNotEmpty({ message: "Category ID harus diisi" })
    @IsString()
    readonly categoryId: string;

    @IsNotEmpty({ message: "Jumlah budget harus diisi" })
    @IsNumber({maxDecimalPlaces: 2})
    @Min(0.01, { message: 'Jumlah budget harus lebih dari 0' })
    readonly amount: number;

    @IsNotEmpty({ message: 'Tanggal mulai harus diisi' })
    @IsDateString()
    readonly startDate: string;

    @IsNotEmpty({ message: 'Tanggal selesai harus diisi' })
    @IsDateString()
    readonly endDate: string;
}

