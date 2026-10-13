import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto, type DeckResponse, GenerateDeckDto, type MessageResponse, UpdateDeckDto } from './dto';
import { toDeckDeletedResponse, toDeckResponse } from './mappers/deck.response-mapper';

@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Get()
  async findAll(): Promise<DeckResponse[]> {
    const decks = await this.decksService.findAll();
    return decks.map(toDeckResponse);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<DeckResponse> {
    return toDeckResponse(await this.decksService.findById(id));
  }

  @Post()
  async create(@Body() dto: CreateDeckDto): Promise<DeckResponse> {
    return toDeckResponse(await this.decksService.create(dto));
  }

  @Post('generate')
  async generate(@Body() dto: GenerateDeckDto): Promise<DeckResponse> {
    return toDeckResponse(await this.decksService.generate(dto));
  }

  @Put(':id')
  async replace(@Param('id') id: string, @Body() dto: UpdateDeckDto): Promise<DeckResponse> {
    return toDeckResponse(await this.decksService.replace(id, dto));
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<MessageResponse> {
    await this.decksService.delete(id);
    return toDeckDeletedResponse();
  }
}
