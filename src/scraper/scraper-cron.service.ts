import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { ScraperService } from './scraper.service';

@Injectable()
export class ScraperCronService implements OnModuleInit {
  constructor(private readonly scraperService: ScraperService) {}

  // Method to execute the scraping job
  async executeScrapingJob() {
    try {
      // Clear existing data
      await this.scraperService.clearScraperData();

      // Fetch new data and save to the database
      const data = await this.scraperService.fetchData();
      await this.scraperService.saveScraperDataToDB(data);
    } catch (error) {
      console.error('Error in scraping job:', error);
    }
  }

  // This runs when the module initializes
  async onModuleInit() {
    // Run the job once immediately on deployment
    await this.executeScrapingJob();

    // Schedule to run on the first day of every month at midnight
    cron.schedule('0 0 1 * *', async () => {
      await this.executeScrapingJob();
    });
  }
}
