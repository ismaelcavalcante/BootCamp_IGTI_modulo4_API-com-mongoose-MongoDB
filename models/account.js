import mongoose from 'mongoose';

//Criação do modelo
const accountSchema = mongoose.Schema({
  agencia: {
    type: Number,
    required: true,
  },
  conta: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    validate(value) {
      if (value < 0)
        throw new Error('Valor negativo para o balance não é permitido');
    },
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

//Definindo o modelo coleção
const accountModel = mongoose.model('accounts', accountSchema, 'accounts');

export { accountModel };
