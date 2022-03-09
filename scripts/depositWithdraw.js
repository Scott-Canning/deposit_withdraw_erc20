const { ethers } = require("hardhat");
const daiJSON = require('../utils/dai.json');

async function main() {

  //create erc20 token
  const Token = await ethers.getContractFactory("Jupiter");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // get signers and test sending the
  [signer1, signer2] = await ethers.getSigners();

  // // create dai
  // const DAI_KOVAN = '0xC4375B7De8af5a38a93548eb8453a498222C4fF2';
  // const token = new ethers.Contract(DAI_KOVAN, daiJSON, signer1);
  
  let ownerBalance = await token.balanceOf(signer1.address);
  console.log("Signer1        : ",  signer1.address);
  console.log("Signer1 balance: ",  ownerBalance);
  console.log("Signer2        : ",  signer2.address);
  console.log("Transferring 20 tokens to Signer2...");
  await token.transfer(signer2.address, 20);
  const signer2balance = await token.balanceOf(signer2.address);
  console.log("Signer2 balance: ",  signer2balance);
  ownerBalance = await token.balanceOf(signer1.address);
  console.log("Signer1 balance: ",  ownerBalance);
  console.log("\n");
  

  // launch contract
  const Contract = await ethers.getContractFactory("DepositWithdraw");
  const contract = await Contract.deploy();
  await contract.deployed();
  console.log('Contract deployed to address: ', contract.address);

  // signer 1 approves and allowance for the Contract to take the deposit
  const approve = await token.approve(contract.address, 11);
  //const approve = await contract.approveDeposit(token.address, 11);
  //console.log('Approve: ', approve);

  const allowance = await token.allowance(signer1.address, contract.address);
  console.log('Allowance: ', allowance);

  console.log("depositing 10 tokens into contract...");
  const deposit = await contract.depositSource(token.address, 10);
  //console.log('Deposit: ', deposit);
  // contract.on("Deposited", (_address, _uint256) =>  {
  //   console.log("Deposited: ", _address, _uint256);
  // })

  let contractBalance = await token.balanceOf(contract.address);
  console.log("Contract balance: ",  contractBalance);

  console.log("withdrawing 5 tokens from contract...");
  const withdraw = await contract.withdrawSource(token.address, 5);
  //console.log('Withdraw: ', withdraw);
  // contract.on("Withdrawn", (_address, _uint256) =>  {
  //   console.log("Withdrawn: ", _address, _uint256);
  // })

  contractBalance = await token.balanceOf(contract.address);
  console.log("Contract balance: ",  contractBalance);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });