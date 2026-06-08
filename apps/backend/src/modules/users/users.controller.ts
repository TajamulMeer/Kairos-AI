import { Controller, Get, Patch, Body, UseGuards, Request, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateProfileDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() fullName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() avatarUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() state?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() city?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() preferredLanguage?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() coachingInstitute?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() targetYear?: number;
}

class AddFcmTokenDto {
  @ApiProperty() @IsString() token: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get own profile' })
  getProfile(@Request() req: any) { return this.usersService.getProfile(req.user.id); }

  @Patch('profile')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Get('student-profile')
  @ApiOperation({ summary: 'Get student AI profile' })
  getStudentProfile(@Request() req: any) { return this.usersService.getStudentProfile(req.user.id); }

  @Post('fcm-token')
  @ApiOperation({ summary: 'Register FCM token for notifications' })
  addFcmToken(@Request() req: any, @Body() dto: AddFcmTokenDto) {
    return this.usersService.addFcmToken(req.user.id, dto.token);
  }
}
