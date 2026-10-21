import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Schema as MongooseSchema,
  type HydratedDocument,
  Types,
} from 'mongoose';

import { Gathered } from './gathered.schema.js';

export type GatheredItemValue = string | number | boolean | Date;

export type GatheredItemDocument = HydratedDocument<GatheredItem>;

@Schema({
  collection: 'gathered_items',
  timestamps: true,
})
export class GatheredItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Gathered.name,
    required: true,
    immutable: true,
  })
  gathered!: Types.ObjectId;

  @Prop({
    type: Map,
    of: MongooseSchema.Types.Mixed,
    required: true,
    default: () => ({}),
  })
  values!: Map<string, GatheredItemValue>;

  createdAt!: Date;

  updatedAt!: Date;
}

export const GatheredItemSchema = SchemaFactory.createForClass(GatheredItem);

GatheredItemSchema.index({
  gathered: 1,
  createdAt: -1,
  _id: -1,
});
