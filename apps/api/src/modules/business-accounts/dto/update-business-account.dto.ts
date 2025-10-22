import { PartialType } from '@nestjs/swagger';
import { CreateBusinessAccountDto } from './create-business-account.dto';

export class UpdateBusinessAccountDto extends PartialType(CreateBusinessAccountDto) {}
