import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get() getAll(@Request() req: any, @Query('unreadOnly') unreadOnly?: boolean) {
    return this.notificationsService.getUserNotifications(req.user.id, unreadOnly);
  }
  @Get('unread-count') getUnreadCount(@Request() req: any) { return this.notificationsService.getUnreadCount(req.user.id); }
  @Patch(':id/read') markRead(@Param('id') id: string, @Request() req: any) { return this.notificationsService.markAsRead(id, req.user.id); }
  @Patch('read-all') markAllRead(@Request() req: any) { return this.notificationsService.markAllRead(req.user.id); }
  @Post('register-token') registerToken(@Body() body: { token: string; platform: string }, @Request() req: any) {
    return this.notificationsService.registerFcmToken(req.user.id, body.token, body.platform);
  }
}
