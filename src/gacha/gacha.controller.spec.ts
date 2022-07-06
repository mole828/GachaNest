import { Test, TestingModule } from '@nestjs/testing';
import { GachaController } from './gacha.controller';

describe('GachaController', () => {
  let controller: GachaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GachaController],
    }).compile();

    controller = module.get<GachaController>(GachaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
