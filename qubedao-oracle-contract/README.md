<div align="center">
<img src="https://user-images.githubusercontent.com/86096361/189986634-30fb7843-f3c7-4294-9ae5-cb57dfb946de.png" width="300"/>
</div>
<div align="center">


<b><b>ton-link</b></b> allows TON smart contract to access data outside the network, while maintaining data security. We plan to make the first decentralized network of oracles on the TON blockchain.
</div>

# Info
This repository stores the oracle contract code (so far centralized). An oracle contract is required to pass data received from a node to another contract. The oracle contract is arranged like a ring. When a request is received, it remembers all the necessary information from the sender and creates a new message for him with all the necessary information. We advise you to first carefully study the oracle core code and the client code for its interaction.

### Quick sketch
<img src="https://user-images.githubusercontent.com/86096361/190497551-5660869c-df9b-4943-b750-0ac193485265.png" width="500"/>
