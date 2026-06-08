import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FirebaseAuthDto {
  @ApiProperty() @IsString() idToken: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fullName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phoneNumber?: string;
}
