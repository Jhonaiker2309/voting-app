// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    const Voting = await ethers.getContractFactory("Voting");
    console.log("Deploying Voting...");
    const voting = await upgrades.deployProxy(Voting, [20], {
        initializer: "initialize",
    });
    await voting.deployed();
    console.log("Voting deployed to:", voting.address);
}

main();