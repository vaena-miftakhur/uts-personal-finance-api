import { IsUUID, IsIn, IsNumber, IsPositive, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID('all', { message: 'Account ID harus berupa UUID yang valid'})
  accountsId: string;

  @IsUUID('all', { message: 'Category ID harus berupa UUID yang valid'})
  categoryId: string;

  @IsIn(['income', 'outcome'], { message: 'Tipe transaksi hanya boleh income atau outcome'})
  type: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Nominal transaksi harus berupa angka dengan maksimal 2 angka desimal' })
  @IsPositive({ message: 'Nominal transaksi harus lebih besar dari 0'})
  amount: number;

  @IsDateString({}, { message: 'Tanggal transaksi harus menggunakan format tanggal yang valid (YYYY-MM-DD)' })
  transactionDate: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi transaksi harus berupa teks'})
  description?: string | null;
}