const { expect } = require("chai");
const { ethers } = require("hardhat");
const {increaseBlocks, increaseTime, currentTime, toDays, toWei, fromWei} = require("./utils")

describe("voting", function() {
  let Voting, voting, owner, address1, address2, address3, address4, address5;

  beforeEach( async() => {
    Voting = await ethers.getContractFactory("Voting");
    
    [owner, address1, address2, address3, address4, address5] = await ethers.getSigners()
    voting = await Voting.deploy();
  })

  describe("Deployment", () => {
        it("Should set the right owner", async () => {
      expect (await voting.owner()).to.equal(owner.address);
    })
  })

  describe("Add elections", ()=> {
    it("3 elections should be added", async () => {
      
      await voting.createElection("Election for president")
      await voting.createElection("Election for senator")
      await voting.createElection("Election for CEO")

      let election3 = await voting.elections(3)

      expect(await voting.numberOfElections()).to.be.equal(3)
      expect(election3.name).to.be.equal("Election for CEO")
      expect(election3.numberOfCandidates).to.be.equal(0)
      expect(election3.id).to.be.equal(3)

      await expect(
        voting.connect(address1).createElection("Election for king")
      ).to.be.revertedWith("You are not allowed to do this action");

    })
})

  describe("Add candidates", () => {
    it("Add candidates to elections", async () => {
    
      await voting.createElection("Election for president")
      await voting.createElection("Election for senator")

      await voting.addCandidate("Alejandro", 1, owner.address)
      await voting.addCandidate("Wilmer", 1, address1.address)
      await voting.addCandidate("Elias", 1, address2.address)
      await voting.addCandidate("Pedro", 1, address3.address)
      await voting.addCandidate("Carlos", 1, address4.address)     
      await voting.addCandidate("Pedro", 2, address3.address)
      
      expect(await voting.numberOfCandidatesByElection(1)).to.be.equal(5)
      expect(await voting.numberOfCandidatesByElection(2)).to.be.equal(1)

      let candidate1InElection1 = await voting.candidatesByElection(1, 1)
      let candidate4InElection1 = await voting.candidatesByElection(1, 4)
      let candidate1InElection2 = await voting.candidatesByElection(2, 1)

      expect(candidate1InElection1.name).to.be.equal("Alejandro")
      expect(candidate4InElection1.name).to.be.equal("Pedro")
      expect(candidate1InElection2.name).to.be.equal("Pedro")

      await expect(
        voting.connect(address1).addCandidate("Oscar", 1, address1.address)
      ).to.be.revertedWith("You are not allowed to do this action");

      await expect(
        voting.addCandidate("Oscar", 20, address1.address)
      ).to.be.revertedWith("The election doesn't exits");

      await increaseTime(toDays(8))
    
      await expect(
        voting.addCandidate("Oscar", 1, address1.address)
      ).to.be.revertedWith("Election already closed");

      await increaseTime(toDays(-8))

      await expect(
        voting.addCandidate("Oscar", 1, address1.address)
      ).to.be.revertedWith("There are already 5 candidates");       

      
    
  })
})

  describe("Test register and votes", () => {
    it("Test register and votes", async () => {
        
        await voting.createElection("Election for president")
        await voting.createElection("Election for CEO")

        await voting.addCandidate("Alejandro", 1, owner.address)
        await voting.addCandidate("Wilmer", 1, address1.address)
        await voting.addCandidate("Pepe", 1, address2.address)
        await voting.addCandidate("Cesar", 2, address3.address)
        await voting.addCandidate("Alejandro", 2, owner.address)

        await voting.connect(owner).register({value: toWei(0.1)})
        await voting.connect(address1).register({value: toWei(0.1)})
        await voting.connect(address2).register({value: toWei(0.1)})
        await voting.connect(address3).register({value: toWei(0.1)})

        await expect(
        voting.connect(address1).register({value: toWei(0.1)})
      ).to.be.revertedWith("User already registered"); 

        await expect(
        voting.connect(address4).register({value: toWei(0.01)})
      ).to.be.revertedWith("You need to pay 0.1 ether to vote"); 

      await voting.connect(owner).vote(1,2)
      await voting.connect(owner).vote(2,1)
      await voting.connect(address1).vote(1,1)
      await voting.connect(address2).vote(1,1)
      await voting.connect(address3).vote(1,1)

      let candidate1InElection1 = await voting.candidatesByElection(1, 1)
      let candidate2InElection1 = await voting.candidatesByElection(1, 2)
      let candidate1InElection2 = await voting.candidatesByElection(2, 1)

      expect(candidate1InElection1.votes).to.be.equal(3)   
      expect(candidate2InElection1.votes).to.be.equal(1)    
      expect(candidate1InElection2.votes).to.be.equal(1)     

      await expect(
        voting.connect(owner).vote(1,1)
      ).to.be.revertedWith("Elector already voted in this election");   

      await expect(
        voting.connect(address4).vote(1,1)
      ).to.be.revertedWith("User is not registered"); 

      await expect(
        voting.connect(address1).vote(2,10)
      ).to.be.revertedWith("Candidate doesn't exist");  

      await expect(
        voting.connect(address3).vote(2,1)
      ).to.be.revertedWith("A candidate can't vote for himself"); 

      
      await increaseTime(toDays(8))

      await expect(
        voting.connect(address3).vote(2,1)
      ).to.be.revertedWith("Election is already closed"); 

    })

 
  })

  describe("The moves of ethereum", () => {
    it("Test contract balance and withdraw", async () => {
      expect(await voting.contractBalance()).to.be.equal(toWei(0))

      await voting.connect(owner).register({value: toWei(0.1)})
      await voting.connect(address1).register({value: toWei(0.1)})

      expect(await voting.contractBalance()).to.be.equal(toWei(0.2))

      await voting.withdraw()

      expect(await voting.contractBalance()).to.be.equal(toWei(0))

      await expect(
        voting.connect(address1).withdraw()
      ).to.be.revertedWith("You are not allowed to do this action");       

      await expect(
        voting.connect(address1).contractBalance()
      ).to.be.revertedWith("You are not allowed to do this action");          

    })
  })

})