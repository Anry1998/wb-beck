import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedersService } from './seeders.service';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(
    AppModule,
  );

  const seedAll = process.argv[2];
  switch (seedAll) {
    case 'seed-all':
      const seedersService = application.get(SeedersService);
      await seedersService.seedAll();
      break;
    default:
      console.log('Command not found');
      process.exit(1);
  }

  await application.close();
  process.exit(0);
}

bootstrap();