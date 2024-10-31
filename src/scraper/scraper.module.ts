import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { ScraperCronService } from './scraper-cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScraperData } from './scraper-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScraperData])],
  controllers: [ScraperController],
  providers: [ScraperService, ScraperCronService],
  exports: [ScraperService],
})
export class ScraperModule {}
