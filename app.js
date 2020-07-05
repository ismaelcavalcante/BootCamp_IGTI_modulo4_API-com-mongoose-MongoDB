import express from 'express';
import { routers } from './routes/accountRouter.js';
import mongoose from 'mongoose';

//Conectar ao MongoDb pelo Mongoose
(async () => {
  try {
    await mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  } catch (err) {
    console.log('Erro ao conectar ao MongoDB: ', err);
  }
})();

const app = express();

app.use(express.json());
app.use(routers);

app.listen(process.env.PORT, () => console.log('API Iniciada'));
