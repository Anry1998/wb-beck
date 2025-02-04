// import { Test, TestingModule } from '@nestjs/testing';
// import { RoleService } from './role.service';

// describe('TestingService', () => {
//   let service: RoleService;

//   const mock = {
//     getAllLimitOffset: jest.fn(),
//     getAllLimitOffsetGuard: jest.fn(),
//     getById: jest.fn(),
//     getByIdGuard: jest.fn(),
//     createRole: jest.fn(),
//     updateRole: jest.fn(),
//     deleteRole:  jest.fn(),
//     getPermissionsFromRolesIdArr: jest.fn(),
//   }

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         RoleService,
//         {provide: RoleService, useValue: mock}
//       ],
//     }).compile();

//     service = module.get<RoleService>(RoleService);
//   });

//   it('createRole', () => {
//     // expect(service).toBeDefined();
//     it('Должна создаться новая роль ', async () => {
//       const res = await service.createRole({name: 'ADMIN', vailableEveryone: true, permissions: [1]})
//     })
    
//   });
// });