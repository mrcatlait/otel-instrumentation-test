import { Module } from '@nestjs/common'

import { HttpController } from './http.controller'

@Module({
  imports: [],
  controllers: [HttpController],
  providers: [],
})
export class HttpModule {}
