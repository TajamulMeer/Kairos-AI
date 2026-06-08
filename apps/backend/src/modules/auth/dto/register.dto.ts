import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsNumber, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsString() @MinLength(2) fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phoneNumber?: string;
  @ApiProperty({ required: false, default: 'NEET' }) @IsOptional() @IsString() examTarget?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() classYear?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() targetYear?: number;
  @ApiProperty({ required: false, default: 'en' }) @IsOptional() @IsString() preferredLanguage?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() state?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() city?: string;
}
