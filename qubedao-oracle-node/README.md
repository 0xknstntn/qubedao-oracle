<div align="center">
<img src="https://user-images.githubusercontent.com/86096361/189986634-30fb7843-f3c7-4294-9ae5-cb57dfb946de.png" width="300"/>
</div>
<div align="center">


<b><b>ton-link</b></b> allows TON smart contract to access data outside the network, while maintaining data security. We plan to make the first decentralized network of oracles on the TON blockchain.
</div>

## Info
This repository stores the oracle node code (so far centralized). An oracle node is needed to supply data from the real world to the blockchain. Note that now you need to change the part of the code related to getting data from the real world. At the moment, the node is used to supply information about the price of a TON.

## Build
  1. [Install Node 16.17.0](https://nodejs.org/en/)
  2. Download ton-link-node ``` git clone https://github.com/ton-link/ton-link-node.git ```
  3. Start ```./install```
  4. Create .env file
  5. Start ton-link-node ```./tonlink mainnet/testnet```
