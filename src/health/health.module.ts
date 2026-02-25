import { TerminusModule } from '@nestjs/terminus';
import { Module } from '@nestjs/common';
import { AppController } from '../app.controller';
// import {
//   HttpModule
// } from  '@nestjs/axios'

@Module({
  imports: [
    TerminusModule,
    // HttpModule
  ],
  // controllers: [HealthController],
})
export class HealthModule {}
