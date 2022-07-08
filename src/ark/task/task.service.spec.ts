import { Test, TestingModule } from '@nestjs/testing';
import { GachaUpdateService } from './task.service';

describe('TaskService', () => {
  let service: GachaUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GachaUpdateService],
    }).compile();

    service = module.get<GachaUpdateService>(GachaUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
