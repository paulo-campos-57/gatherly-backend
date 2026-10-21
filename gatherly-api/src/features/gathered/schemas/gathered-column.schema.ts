import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { GatheredColumnType } from '../enums/column-type.enum.js';

@Schema({ _id: false })
export class GatheredColumn {
  @Prop({
    type: String,
    required: true,
    trim: true,
    match: /^[a-z][a-z0-9_]*$/,
  })
  key!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  })
  label!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GatheredColumnType),
  })
  type!: GatheredColumnType;

  @Prop({
    type: Boolean,
    default: false,
  })
  required!: boolean;
}

export const GatheredColumnSchema =
  SchemaFactory.createForClass(GatheredColumn);
