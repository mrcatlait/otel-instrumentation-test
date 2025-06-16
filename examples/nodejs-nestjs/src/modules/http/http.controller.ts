import { Controller, Get } from '@nestjs/common'

@Controller('http')
export class HttpController {
  @Get()
  getHello(): string {
    return 'Hello World'
  }
}
