import { Test, TestingModule } from '@nestjs/testing';
import { DiscordBotGateway } from './discord-bot.gateway';

describe('DiscordBotGateway', () => {
  let gateway: DiscordBotGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordBotGateway],
    }).compile();

    gateway = module.get<DiscordBotGateway>(DiscordBotGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
