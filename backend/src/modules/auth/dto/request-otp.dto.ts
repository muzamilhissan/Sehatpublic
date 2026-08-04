import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @Matches(/^(\+92[0-9]{10}|0[0-9]{10})$/, {
    message: 'phone must be a valid Pakistani number, e.g. 03001234567 or +923001234567',
  })
  phone!: string;
}
