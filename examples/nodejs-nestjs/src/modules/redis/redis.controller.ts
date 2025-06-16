import { Controller, Get, Post } from '@nestjs/common'

import { RedisService } from './redis.service'

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get()
  async getData() {
    await this.redisService.set('test', 'test')
    return this.redisService.get('test')
  }

  @Post()
  setData() {
    return this.redisService.set('test', 'test')
  }
}
