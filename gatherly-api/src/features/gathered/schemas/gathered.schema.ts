import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { Types } from 'mongoose';
import {
  GatheredColumn,
  GatheredColumnSchema,
} from './gathered-column.schema.js';

@Schema({
  collection: 'gathereds',
  timestamps: true,
})
export class Gathered {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  })
  owner!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  })
  name!: string;

  @Prop({
    type: String,
    trim: true,
    maxLength: 1000,
    default: '',
  })
  description!: string;

  @Prop({
    type: [GatheredColumnSchema],
    required: true,
    default: [],
    validate: [
      {
        validator: (columns: GatheredColumn[]) => columns.length > 0,
        message: 'A collection must have at least one column.',
      },
      {
        validator: (columns: GatheredColumn[]) => {
          const keys = columns.map((column) => column.key);

          return new Set(keys).size === keys.length;
        },
        message: 'Column keys must be unique within the collection.',
      },
    ],
  })
  columns!: GatheredColumn[];

  createdAt!: Date;

  updatedAt!: Date;
}

export const GatheredSchema = SchemaFactory.createForClass(Gathered);

GatheredSchema.index({ owner: 1, createdAt: -1 });
