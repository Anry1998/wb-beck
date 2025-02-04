import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

describe('RoleController', () => {
  let controller: RoleController;

  const mock = {

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [RoleService]
    }).overrideProvider(RoleService).useValue(mock).compile();

    controller = module.get<RoleController>(RoleController);
    
}); 

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});