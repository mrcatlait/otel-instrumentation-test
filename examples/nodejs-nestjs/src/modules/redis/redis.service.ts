import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientType, RedisDefaultModules } from 'redis'

import { RedisEnvironmentVariables } from './redis.env'

@Injectable()
export class RedisService implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name)
  private readonly redisHost: string
  private readonly redisPort: number

  private client: RedisClientType<RedisDefaultModules>

  constructor(private readonly configService: ConfigService<RedisEnvironmentVariables, true>) {
    this.redisHost = this.configService.get('REDIS_HOST')
    this.redisPort = this.configService.get('REDIS_PORT')
  }

  async onApplicationBootstrap(): Promise<void> {
    this.client = (await createClient({
      url: `redis://${this.redisHost}:${this.redisPort}`,
    })
      .on('connect', () => {
        this.logger.log('Initiating a connection to the server')
      })
      .on('ready', () => {
        this.logger.log('Connection to the server has been established successfully')
      })
      .on('reconnecting', () => {
        this.logger.log('Reconnecting to the server')
      })
      .on('error', (error) => {
        this.logger.error('Error connecting to the server', error)
      })
      .connect()) as RedisClientType<RedisDefaultModules>
  }

  get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  set(key: string, value: string): Promise<string | null> {
    return this.client.set(key, value)
  }
}
