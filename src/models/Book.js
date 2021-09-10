const mongoose = require("mongoose");
const {authorSchema} = require("./Author")

const Schema = mongoose.Schema;
const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: authorSchema, required: true },
    authorId:{type:String,required:false}
  },
  {
    timestamps: true,
  }
);
const Book = mongoose.model("Book", bookSchema);
module.exports = { Book, bookSchema };
