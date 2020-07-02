import express from 'express';
import { accountModel } from '../models/account.js';

const routers = express();

routers.get('/account', async (_, res) => {
  try {
    const account = await accountModel.find({});
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

routers.patch('/account/deposit/:agencia/:conta/:balance', async (req, res) => {
  try {
    const backAccount = await accountModel.find({
      agencia: req.params.agencia,
      conta: req.params.conta,
    });

    const account = await accountModel.findOneAndUpdate(
      { agencia: req.params.agencia, conta: req.params.conta },
      { balance: Number(backAccount[0].balance) + Number(req.params.balance) },
      { new: true }
    );

    res.status(200).send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

routers.patch(
  '/account/withdraw/:agencia/:conta/:balance',
  async (req, res) => {
    try {
      const backAccount = await accountModel.find({
        agencia: req.params.agencia,
        conta: req.params.conta,
      });

      if (Number(backAccount[0].balance) < Number(req.params.balance) + 1) {
        throw new Error('Saldo não disponível');
      }

      const account = await accountModel.findOneAndUpdate(
        { agencia: req.params.agencia, conta: req.params.conta },
        {
          balance:
            Number(backAccount[0].balance) - Number(req.params.balance) - 1,
        },
        { new: true }
      );

      res.status(200).send(account);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

routers.get('/account/:agencia/:conta', async (req, res) => {
  try {
    const account = await accountModel.find({
      agencia: req.params.agencia,
      conta: req.params.conta,
    });

    res.send(account);
  } catch (error) {
    res.sendStatus(500).send(error);
  }
});

routers.delete('/account/:agencia/:conta', async (req, res) => {
  try {
    const account = await accountModel.findOneAndDelete({
      agencia: req.params.agencia,
      conta: req.params.conta,
    });

    if (!account) {
      res.status(404).send('Conta não encontrada na coleção');
    }

    const accounts = await accountModel.countDocuments({
      agencia: Number(req.params.agencia),
    });

    res
      .status(200)
      .send(
        `Nº de contas existentes na agência _${req.params.agencia}_: ${accounts} contas`
      );
  } catch (error) {
    res.status(500).send(error);
  }
});

routers.patch(
  '/account/transfer/:contaOrigem/:contaDestino/:value',
  async (req, res) => {
    try {
      const originAccount = await accountModel.find({
        conta: req.params.contaOrigem,
      });

      const destinationAccount = await accountModel.find({
        conta: req.params.contaDestino,
      });

      if (originAccount[0].agencia === destinationAccount[0].agencia) {
        if (Number(originAccount[0].balance) < Number(req.params.value)) {
          throw new Error('Saldo insuficiente');
        }
        const accountOrigin = await accountModel.findOneAndUpdate(
          { conta: req.params.contaOrigem },
          {
            balance:
              Number(originAccount[0].balance) - Number(req.params.value),
          },
          { new: true }
        );
        const accountDestination = await accountModel.findOneAndUpdate(
          { conta: req.params.contaDestino },
          {
            balance:
              Number(destinationAccount[0].balance) + Number(req.params.value),
          },
          { new: true }
        );

        res.status(200).send(accountOrigin);
      } else {
        if (Number(originAccount[0].balance) < Number(req.params.value) + 8) {
          throw new Error('Saldo insuficiente');
        }
        const accountOrigin = await accountModel.findOneAndUpdate(
          { conta: req.params.contaOrigem },
          {
            balance:
              Number(originAccount[0].balance) - Number(req.params.value) - 8,
          },
          { new: true }
        );
        const accountDestination = await accountModel.findOneAndUpdate(
          { conta: req.params.contaDestino },
          {
            balance:
              Number(destinationAccount[0].balance) + Number(req.params.value),
          },
          { new: true }
        );

        res.status(200).send(accountOrigin);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

routers.get('/avg/:agencia', async (req, res) => {
  try {
    const account = await accountModel
      .aggregate()
      .match({ agencia: Number(req.params.agencia) })
      .group({
        _id: '$agencia',
        media_balance: {
          $avg: '$balance',
        },
      });

    res.send(account);
  } catch (error) {
    res.sendStatus(500).send(error);
  }
});

routers.get('/smalls/:client', async (req, res) => {
  try {
    const account = await accountModel
      .aggregate()
      .sort({ balance: 1, name: 1 })
      .limit(Number(req.params.client));

    res.send(account);
  } catch (error) {
    res.sendStatus(500).send(error);
  }
});

routers.get('/biggers/:client', async (req, res) => {
  try {
    const account = await accountModel
      .aggregate()
      .sort({ balance: -1, name: 1 })
      .limit(Number(req.params.client));

    res.send(account);
  } catch (error) {
    res.sendStatus(500).send(error);
  }
});

routers.patch('/private', async (_, res) => {
  try {
    const accounts = await accountModel
      .aggregate()
      .group({
        _id: '$agencia',
        data: {
          $max: {
            balance: '$balance',
            name: '$name',
            conta: '$conta',
            agencia: '$agencia',
          },
        },
      })
      .project({
        _id: 0,
        data: 1,
      });

    accounts.map(async (item) => {
      const account = await accountModel.findOneAndUpdate(
        { conta: item.data.conta },
        { agencia: 99 },
        { new: true }
      );
    });

    res.send(accounts);
  } catch (error) {
    res.sendStatus(500).send(error);
  }
});

routers.post('/account', async (req, res) => {
  try {
    const account = new accountModel(req.body);
    await account.save();

    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

export { routers };
