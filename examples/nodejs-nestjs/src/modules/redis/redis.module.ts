import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import * as Joi from 'joi'

import { RedisService } from './redis.service'
import { RedisController } from './redis.controller'
import { RedisEnvironmentVariables } from './redis.env'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object<RedisEnvironmentVariables>({
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
  ],
  providers: [RedisService],
  controllers: [RedisController],
  exports: [],
})
export class RedisModule {}
