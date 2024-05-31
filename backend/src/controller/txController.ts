import { type Request, type Response } from "express";
import txListModel from "../model/txListModel";
import {
  generateRuneSendPsbt,
  generateBTCSendPsbt,
  createRune,
} from "../service/purchase.psbt.service";
import { combinePsbt } from "../service/psbt.utils";
import {
  getTxListObjectViaId,
  getEtchingRuneObjectViaName,
} from "../service/database.service";
import {
  getRuneUtxoByAddress,
  getBtcUtxoByAddress,
} from "../service/psbt.utils";
import { getRuneToken } from "../service/database.service";
import { calcTokenBalance } from "../service/utils.service";
import { ADMIN_PAYMENT_ADDRESS } from "../config/config";
import { TxListStatus } from "../config/constant";
import { getTxStatus } from "../service/mempool";
import etchingRuneModel from "../model/etchingRuneModel";

export const preSellRuneToken = async (req: Request, res: Response) => {
  try {
    const {
      runeId,
      runeName,
      runeAmount,
      senderPaymentAddress,
      senderPaymentPubkey,
      senderOrdinalAddress,
      senderOrdinalPubkey,
    } = req.body;

    const runeBlock = runeId.split(":")[0];
    const runeTx = runeId.split(":")[1];
    const usedTxList: string[] = [];

    const btcUtxos = await getBtcUtxoByAddress(senderPaymentAddress);
    const { runeUtxos, tokenSum, divisibility } = await getRuneUtxoByAddress(
      senderOrdinalAddress,
      runeBlock + ":" + runeTx
    );

    if (tokenSum < runeAmount * 10 ** divisibility)
      return res
        .status(500)
        .json({ success: false, msg: "You have not got enough token" });

    const splitRune = createRune(
      BigInt(runeBlock),
      BigInt(runeTx),
      tokenSum,
      runeAmount * 10 ** divisibility
    );

    const psbt = await generateRuneSendPsbt(
      splitRune.buffer,
      btcUtxos,
      runeUtxos,
      ADMIN_PAYMENT_ADDRESS,
      usedTxList,
      senderOrdinalPubkey,
      senderPaymentPubkey,
      senderPaymentAddress,
      senderOrdinalAddress
    );

    const newTxList = new txListModel({
      receiveAddress: senderPaymentAddress,
      runeName,
      runeId,
      type: 1,
      runeAmount: runeAmount * 10 ** divisibility,
      psbt: psbt.toHex(),
    });

    const saveTx = await newTxList.save();

    return res.status(200).json({
      success: true,
      id: saveTx.id,
      psbtHex: psbt.toHex(),
      psbtBase64: psbt.toBase64(),
    });
  } catch (error) {
    console.log("Pre Sell Rune Token Error => ", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error Occurs while Selling Rune Tokens" });
  }
};

export const sellRuneToken = async (req: Request, res: Response) => {
  try {
    const { id, runeId, signedPsbt } = req.body;
    const txListRuneDoc: any = await getTxListObjectViaId(id);
    const runeDocument = await getEtchingRuneObjectViaName(
      txListRuneDoc.runeName
    );
    if (!runeDocument)
      return res
        .status(500)
        .json({ success: false, msg: "Can not find Rune Token" });
    const remainRuneAmount = await getRuneToken(runeDocument);

    const tokenBalance = await calcTokenBalance(
      remainRuneAmount + txListRuneDoc.runeAmount,
      runeDocument.runeAmount * runeDocument.initialPrice
    );

    console.log(tokenBalance);

    const txId = await combinePsbt(txListRuneDoc.psbt, signedPsbt);
    console.log("Sell Rune Token TxID => ", txId);

    txListRuneDoc.txId = txId;
    txListRuneDoc.status = TxListStatus.PENDING;
    txListRuneDoc.signedPSBT = signedPsbt;
    txListRuneDoc.btcAmount = tokenBalance * txListRuneDoc.runeAmount;
    await txListRuneDoc.save();

    return res
      .status(200)
      .json({ success: true, msg: "Selling Token Now. Please Wait!" });
  } catch (error) {
    console.log("Sell Rune Token Error => ", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error Occurs while Selling Rune Tokens" });
  }
};

export const preBuyRuneToken = async (req: Request, res: Response) => {
  try {
    const {
      walletType,
      runeId,
      runeName,
      runeAmount,
      buyerPaymentAddress,
      buyerPaymentPubkey,
      buyerOrdinalAddress,
      buyerOrdinalPubkey,
    } = req.body;
    const runeDocument = await getEtchingRuneObjectViaName(runeName);
    if (!runeDocument)
      return res
        .status(500)
        .json({ success: false, msg: "Can not find Rune Token" });
    const remainRuneAmount = await getRuneToken(runeDocument);
    if (runeAmount * 10 ** runeDocument.divisibility > remainRuneAmount)
      return res.status(500).json({ success: false, msg: "Not Enough Tokens" });

    const tokenBalance = await calcTokenBalance(
      remainRuneAmount - runeAmount * 10 ** runeDocument.divisibility,
      runeDocument.runeAmount * runeDocument.initialPrice
    );
    const usedUtxos: string[] = [];

    const generateBuyRunePsbt = await generateBTCSendPsbt(
      walletType,
      ADMIN_PAYMENT_ADDRESS,
      buyerOrdinalPubkey,
      buyerPaymentPubkey,
      buyerOrdinalAddress,
      tokenBalance * runeAmount * 10 ** runeDocument.divisibility,
      usedUtxos
    );

    const newTxList = new txListModel({
      receiveAddress: buyerOrdinalAddress,
      runeName,
      runeId,
      type: 0,
      runeAmount: runeAmount * 10 ** runeDocument.divisibility,
      psbt: generateBuyRunePsbt.toHex(),
      btcAmount: tokenBalance * runeAmount * 10 ** runeDocument.divisibility,
    });

    const saveTx = await newTxList.save();

    return res.status(200).json({
      success: true,
      id: saveTx.id,
      psbtHex: generateBuyRunePsbt.toHex(),
      psbtBase64: generateBuyRunePsbt.toBase64(),
    });
  } catch (error) {
    console.log("Pre Buy Rune Token Error => ", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error Occurs while Buying Rune Tokens" });
  }
};

export const buyRuneToken = async (req: Request, res: Response) => {
  try {
    const { id, signedPsbt, walletType } = req.body;
    const txListRuneDoc: any = await getTxListObjectViaId(id);
    const runeDocument = await getEtchingRuneObjectViaName(
      txListRuneDoc.runeName
    );
    if (!runeDocument)
      return res
        .status(500)
        .json({ success: false, msg: "Can not find Rune Token" });

    const txId = await combinePsbt(txListRuneDoc.psbt, signedPsbt);
    console.log("Buy Rune Token TxID => ", txId);

    txListRuneDoc.txId = txId;
    txListRuneDoc.status = TxListStatus.PENDING;
    txListRuneDoc.signedPSBT = signedPsbt;
    await txListRuneDoc.save();

    return res
      .status(200)
      .json({ success: true, msg: "Buying Token Now. Please Wait!" });
  } catch (error) {
    console.log("Buy Rune Token Error => ", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error Occurs while Buying Rune Tokens" });
  }
};

export const checkTxListStatus = async () => {
  try {
    let _cnt = 0;
    let completedArray: Record<string, number> = {};
    const runeIdList: string[] = [];
    const txList: any = await txListModel.find({
      status: TxListStatus.PENDING,
    });
    const checkTxList = await Promise.all(
      txList.map((eachItem: any) => getTxStatus(eachItem.txId))
    );
    for (const eachItem of checkTxList) {
      if (eachItem.confirmed) {
        let runeName = txList[_cnt].runeName;
        if (!completedArray[runeName]) {
          completedArray[runeName] = 0;
          runeIdList.push(runeName);
        }

        if (txList[_cnt].type === 0)
          completedArray[runeName] -= txList[_cnt].runeAmount;
        else completedArray[runeName] += txList[_cnt].runeAmount;

        await txListModel.findOneAndUpdate(
          {
            _id: txList[_cnt].id,
          },
          { status: TxListStatus.COMPLETED }
        );
      }
      _cnt++;
    }

    for (const item of runeIdList) {
      const filterItem = await etchingRuneModel.findOne({
        runeName: { $regex: item.toLocaleLowerCase(), $options: "i" },
      });
      if (filterItem) {
        filterItem.remainAmount += completedArray[item];
        await filterItem.save();
      }
    }
  } catch (error) {
    console.log(error);
  }
  return;
};
