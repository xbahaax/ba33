import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { CollectionModule } from '../../modules/collection/collection.module';

@Module({
  imports: [CollectionModule],
  providers: [ScheduledTasksService],
})
export class TasksModule {}
