const {ApolloServer,gql} = require("apollo-server")
const mongoose = require("mongoose");
const {Author} = require('./models/Author')
const {Book} = require('./models/Book')
const dotenv = require("dotenv");
dotenv.config(__dirname + "../.env");

const faker = require("faker");
const DataLoader = require("dataloader");

const pushSampleData = async () => {
    for await (const elt of (new Array(20))) {
      const author = new Author({
        name: faker.name.findName()
      });
      const savedAuthor = await author.save();
      const book = new Book({
        title: faker.company.companyName(),
        author: savedAuthor,
        authorId:savedAuthor._id
      });
      const savedBook = await book.save();
    }
    return true;
  };
  
const startServer = async () => {
    mongoose
	.connect(process.env.MONGO_URL, { useNewUrlParser: true })
	.then(() => console.log("connected to db"))
	.catch((error) => console.log("connection error", error));
    await pushSampleData()

const typeDefs = gql`
  type Author {
    id: ID!
    name: String!
  }
  type Book {
    id: ID!
    title: String
    author: Author!
  }
  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Book: {
    author: async (parent, _, ctx) => {
      return ctx.authorLoader.load(parent.authorId);;
    }
  },
  Query: {
    books: async () => {
      const books = await Book.find()
      console.log(books)
      return books;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers ,
      context: () => {
        return {
          authorLoader: new DataLoader(async keys => {
            const authors = await Author.find();

            const authorMap = {};
            authors.forEach(author => {
              authorMap[author._id] = author;
            });

            return keys.map(key => authorMap[key]);
          })
        };
}});

server.listen().then(({ url }) => {
console.log(`🚀  Server ready at ${url}`);
});

}
startServer()