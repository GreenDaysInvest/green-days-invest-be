import { Injectable } from '@nestjs/common';
import * as cron from 'node-cron';
import { ScraperService } from './scraper.service';

@Injectable()
export class ScraperCronService {
  constructor(private readonly scraperService: ScraperService) {
    // Schedule to run on the first day of every month at midnight
    cron.schedule('0 0 1 * *', async () => {
      try {
        // Clear existing data
        await this.scraperService.clearScraperData();

        // Fetch new data and save to the database
        const data = await this.scraperService.fetchData();
        await this.scraperService.saveScraperDataToDB(data);
      } catch (error) {
        console.error('Error in monthly scraper job:', error);
      }
    });
  }
}
