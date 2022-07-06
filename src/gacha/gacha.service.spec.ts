import { Test, TestingModule } from '@nestjs/testing';
import { GachaService } from './gacha.service';

describe('GachaService', () => {
  let service: GachaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GachaService],
    }).compile();

    service = module.get<GachaService>(GachaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
