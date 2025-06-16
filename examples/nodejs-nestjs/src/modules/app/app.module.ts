import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { RedisModule } from '../redis'
import { HttpModule } from '../http'

@Module({
  imports: [ConfigModule.forRoot(), RedisModule, HttpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
