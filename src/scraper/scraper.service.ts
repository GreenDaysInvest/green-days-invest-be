import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScraperData } from './scraper-data.entity';
import { spawn } from 'child_process';

@Injectable()
export class ScraperService {
  constructor(
    @InjectRepository(ScraperData)
    private readonly scraperDataRepository: Repository<ScraperData>,
  ) {}

  async fetchData(): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', ['./gruenebluete.de.py']);

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (error) => {
        reject(error.toString());
      });

      pythonProcess.on('close', () => {
        try {
          resolve(JSON.parse(output));
        } catch (error) {
          reject(`Parsing error: ${error}`);
        }
      });
    });
  }

  async clearScraperData(): Promise<void> {
    await this.scraperDataRepository.clear();
  }

  async saveScraperDataToDB(data: any[]): Promise<void> {
    const scraperData = data.map((item) =>
      this.scraperDataRepository.create({
        name: item.Name,
        image: item.Image,
        link: item.Link,
        genetic: item.Genetic,
        thc: item.THC,
        cbd: item.CBD,
        availability: item.Availability,
        price: item.Price,
      }),
    );

    await this.scraperDataRepository.save(scraperData);
  }

  // Retrieve data from the PostgreSQL database
  async getScraperData(): Promise<ScraperData[]> {
    return this.scraperDataRepository.find();
  }
}
