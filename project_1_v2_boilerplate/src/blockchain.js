/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

//test 5 minutes waiting for
/*function testSleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
*/

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            let newBlock = block;
            let currentBlockchain = self;
            
            let currentHeight = await currentBlockchain.getChainHeight();
            //console.log(`currentHeight : ${currentHeight}`);

            //You will need to check for the height to assign the `previousBlockHash`,
            if(currentHeight > -1) {
                newBlock.previousBlockHash = currentBlockchain.chain[currentHeight].hash;  
            }

            //assign the `timestamp` and the correct `height`...At the end you need to
            newBlock.time = new Date().getTime().toString().slice(0,-3);
            newBlock.height = currentHeight + 1;
            
            //create the `block hash` and push the block into the chain array. Don't for get 
            // to update the `this.height
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            currentBlockchain.chain.push(newBlock);
            currentBlockchain.height = currentHeight + 1;
            
            let isValidate = await block.validate();
            //console.log(`isValidate : ${isValidate}`);

            if(isValidate) {
                //console.log(`Resolve _addBlock`);
                console.log(`Added new block : ${newBlock}`);
                resolve(newBlock)
            } else {
                reject("Defective chain");
            }
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            let messagedUsedToSign = `${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`;
            //console.log(`requestMessageOwnershipVerification 
            //    for address input : ${address} 
            //    is : ${messagedUsedToSign}`);

            console.log(`Resolve requestMessageOwnershipVerification`);
            resolve(messagedUsedToSign);
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            
              console.log(`Input 
                address :   ${address},
                message :   ${message},
                signature : ${signature},
                star :      ${star}`);
            
            // 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
            let timeFromMessage = parseInt(message.split(':')[1]);
            // console.log(`timeFromMessage : ${timeFromMessage}`);
            
            // await testSleep(300000);

            // 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
            let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
            // console.log(`currentTime : ${currentTime}`);

            // 3.Check if the time elapsed is less than 5 minutes
            let diffTime = Math.abs(currentTime - timeFromMessage);
            let diffMinutes = Math.ceil(diffTime / 60);
            console.log(`diffMinutes : ${diffMinutes}`);

            if(diffMinutes < 5) {

                // 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
                if( bitcoinMessage.verify(message, address, signature) ) {

                    // 5. Create the block and add it to the chain
                    let newBlock = new BlockClass.Block({
                        owner: address, 
                        data : star
                    });
                    
                    console.log(`Resolve submitStar`);
                    resolve(self._addBlock(newBlock));

                } else {
                    console.log(`Not verified bitcoinmessage : ${star}`);
                    reject();
                }
            } else {
                console.log(`Diff minutes is greater then 5 minutes : ${diffMinutes}`);
                reject();
            }


        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            //console.log(`resolve getBlockByHash`);
            // pref to keep .filter on .find to check if anomaly blocks with same hash
            resolve(self.chain.filter(block => block.hash === hash))
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            // pref to keep .filter on .find to check if anomaly blocks with same height
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {

            self.chain.forEach(block => {
                // console.log(`
                //     height : ${block.height}
                //     data : ${block.body}`
                // );

                block.getBData().then(bDataObj => {
                    //console.log(`Check if owner ${bDataObj.owner} is same of input ${address}`);
                    if(bDataObj.owner === address) {
                        stars.push(bDataObj);
                    }
                });

            });

            resolve(stars);
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            let previousHash = "";
            for(let idx = 0; idx < self.chain.length; idx++ ) {
                let block = self.chain[idx];

                // 1. You should validate each block using `validateBlock`
                block.validate().then(isValidate => {
                    if(!isValidate) {
                        errorLog.push(block); 
                    }
                });

                // 2. Each Block should check the with the previousBlockHash 
                if( block.height !== 0 && previousHash === block.hash){
                    errorLog.push(block);
                }
                
                previousHash = block.hash;
            }
        });
    }

}

module.exports.Blockchain = Blockchain;   