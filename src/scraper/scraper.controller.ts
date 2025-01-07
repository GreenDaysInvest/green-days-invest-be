import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperData } from './scraper-data.entity';

@Controller('scraper-data')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get()
  async getScraperData(): Promise<ScraperData[]> {
    return this.scraperService.getScraperData();
  }

  @Get('clear')
  async clearScraperData(): Promise<{ message: string }> {
    await this.scraperService.clearScraperData();
    return { message: 'Scraper data table cleared' };
  }

  @Get('test-save')
  async testSaveData() {
    const mockData = [
      {
        Name: 'Test Product',
        Image: '',
        Link: '',
        Genetic: 'Hybrid',
        THC: '20%',
        CBD: '1%',
        Availability: 'Available',
        Price: '10.99€',
      },
    ];
    await this.scraperService.saveScraperDataToDB(mockData);
    return { message: 'Test data saved' };
  }
}
