/*
        @title: qubedao-oracle node
	@custom: version 1.0
	@custom: forked from https://github.com/ton-link/ton-link-node
	@author: Konstantin Klyuchnikov (knstntn.asuoki.eth)
*/

const TonWeb = require("tonweb");
const tonMnemonic = require("tonweb-mnemonic");
var moment = require('moment');
var clc = require("cli-color");

var express = require('express');
const cors = require('cors');

var app = express();
app.use(cors())

require('dotenv').config()

const Cell = TonWeb.boc.Cell;
const Address = TonWeb.utils.Address;
tonMnemonic.wordlists.EN;
var server = app.listen((parseInt((process.env).PORT_API)));

async function get_actual_price_coinbase(){
        var price = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=TON') //oracle using for get actual price for TON/USD
        price = await price.json();
        var actual_price = price.data.rates.USD
        return (parseFloat(actual_price) * 10**9)
}

async function get_actual_price_ftx(){
        var price = await fetch('https://ftx.com/api/markets') //oracle using for get actual price for TON/USD
        price = await price.json();
        var actual_price = price.result[557].bid
        return (parseFloat(actual_price) * 10**9)
}

async function get_actual_price_huobi(){
        var price = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=TON') //oracle using for get actual price for TON/USD
        price = await price.json();
        var actual_price = price.tick.bid[0]
        return (parseFloat(actual_price) * 10**9)
}

function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
}

async function notification_body() {
        const cell = new Cell();
        cell.bits.writeUint(5100, 32)
        cell.bits.writeUint(0, 64)
        //return (TonWeb.utils.bytesToBase64(await cell.toBoc(false))).toString(); //idk what this dont work, but he return te6cckEBAQEADgAAGAAAE+wAAAAAAAAAAAp4n8I=
        return 'te6ccgEBAQEADgAAGAAAE+wAAAAAAAAAAA=='
}

async function update_price() {
        const cell = new Cell();
        cell.bits.writeUint(1, 32)
        return (TonWeb.utils.bytesToBase64(await cell.toBoc(false))).toString();
}

async function getTime() {
        var now = moment().format("YYYY-MM-DD HH:mm:ss");
        return now
}

async function send(wallet, body, keyPair) {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log(
                await wallet.methods.transfer({
                        secretKey: keyPair.secretKey,
                        toAddress: (process.env).ORACLEADDRESS,
                        amount: TonWeb.utils.toNano("0.01"),
                        seqno: seqno,
                        payload: body,
                        sendMode: 3
                }).send()
        );
        await sleep(6500)
}

async function send_update(wallet, keyPair){
        const cell = new Cell();
        cell.bits.writeUint(1, 32)
        cell.bits.writeUint(0, 64)
        cell.bits.writeUint(2, 32)
        cell.bits.writeUint(get_actual_price_coinbase(), 64)
        cell.bits.writeUint(get_actual_price_ftx(), 64)
        cell.bits.writeUint(get_actual_price_huobi(), 64)
        console.log(clc.red('WARNING'), `[${await getTime()}]`, 'SEND UPDATE', 'ACTUAL PRICE =', (price / 10**9))
        await send(wallet, cell, keyPair)
}

async function main(net) {
        var seed = ((process.env).SEED)
	let arr = seed.split(' ');
        if (net=='testnet') {
                tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: (process.env).TONCENTERKEY_TESTNET}));
        } else {
                tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: (process.env).TONCENTERKEY_MAINNET}));
        }
	const keyPair = await tonMnemonic.mnemonicToKeyPair(arr);
	const WalletClass = tonweb.wallet.all['v3R2'];
	const wallet = new WalletClass(tonweb.provider, {
		publicKey: keyPair.publicKey,
		wc: 0 
	});

	const walletAddress = await wallet.getAddress();
        console.log(clc.green('INFO'), ` [${await getTime()}]`,  'Starting ton-link node...');
        console.log(clc.green('INFO'), ` [${await getTime()}]`,  'Starting API...');
        console.log(clc.yellow('CHECK'), `[${await getTime()}]`, 'Connect to TONCENTER =',clc.green((await tonweb.provider.getWalletInfo(walletAddress.toString(true, true, true))).wallet));
        console.log(clc.yellow('CHECK'), `[${await getTime()}]`, 'Connect to TONAPI =',clc.green((await (await fetch(`https://testnet.tonapi.io/v1/blockchain/getAccount?account=${walletAddress.toString(true, true, true)}`)).json()).status));
	console.log(clc.green('INFO'), ` [${await getTime()}]`, 'Usint wallet =', clc.green(walletAddress.toString(true, true, true)));
        console.log(clc.green('INFO'), ` [${await getTime()}]`, 'Using ton-link oracle =', clc.green((process.env).ORACLEADDRESS));
        console.log(clc.yellow('CHECK'), `[${await getTime()}]`, 'Check ton-link oracle =',clc.green((await (await fetch(`https://testnet.tonapi.io/v1/blockchain/getAccount?account=${(process.env).ORACLEADDRESS}`)).json()).status));
        console.log(clc.green('INFO'), ` [${await getTime()}]`, '---------------------------------------------------------------------------------------------------------------------------------------------------------')

        app.get('/v1/update', async function(req, res){
                console.log(clc.green('INFO'), `[${await getTime()}]`, 'New request');
                await send_update(wallet, keyPair)
                let response = {
                        ok: 'true'
                }
                res.send(response);
        });

        while(1){
                console.log(clc.green('INFO'), `[${await getTime()}]`, 'Waiting for new request...');
                await sleep(1000)
        }
}

if (process.platform === 'win32') {
        require('readline')
                .createInterface({
                        input: process.stdin,
                        output: process.stdout
                })
                .on('SIGINT', function () {
                        process.emit('SIGINT');
                });
}
      

process.on('SIGINT', async function() {
        console.log()
        console.log(clc.red('INFO'), `[${await getTime()}]`, 'Stopped API...');
        server.close();
        console.log(clc.red('INFO'), `[${await getTime()}]`, 'Stopped ton-link node...');
        process.exit();
});

main(process.argv[2])