import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^(\+92[0-9]{10}|0[0-9]{10})$/, {
    message: 'phone must be a valid Pakistani number, e.g. 03001234567 or +923001234567',
  })
  phone!: string;

  @IsString()
  @Length(4, 6)
  code!: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  fullName?: string;
}
