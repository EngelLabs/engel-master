import * as mongoose from 'mongoose';
import type * as types from '@engel/types';
interface TagModel extends mongoose.Model<types.Tag> {
    findOneAndIncrement: typeof Tag.findOne;
    incrementUses(guild: string, name: string): void;
}
declare const Tag: TagModel;
export default Tag;
