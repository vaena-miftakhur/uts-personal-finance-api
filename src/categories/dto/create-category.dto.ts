import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @IsString({ message: 'Nama kategori harus berupa teks' })
  @MaxLength(100, { message: 'Nama kategori maksimal 100 karakter' })
  name: string;

  @IsNotEmpty({ message: 'Tipe kategori wajib diisi' })
  @IsString({ message: 'Tipe kategori harus berupa teks' })
  @IsIn(['income', 'expense'], {
    message: 'Tipe kategori harus berupa "income" atau "expense"',
  })
  type: string;
}