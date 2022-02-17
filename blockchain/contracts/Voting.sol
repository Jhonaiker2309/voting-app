//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


contract Voting is Initializable {
  struct Candidate{
    string name;
    uint votes;
    uint id;
    address wallet;
  }

  struct Election {
    string name;
    uint numberOfCandidates;
    uint id;
    uint dateOfCreation;
    uint dateOfClose;
  }

  mapping(uint => mapping(uint => Candidate)) public candidatesByElection;
  mapping(uint => uint) public numberOfCandidatesByElection;
  mapping(uint => Election) public elections;

  mapping(uint => mapping(address => bool)) public alreadyVotedInThisElection;
  mapping(address => bool) public userRegistered;
  
  uint public numberOfElections;
  address public owner;
  uint public feeToVote;

  // The only function of this number is to check if the contract is upgradeable
  uint upgradeNumber;

  //register, posting candidates, voting, createElection

  event Register(address user);
  event AddCandidate(string name, uint votes, uint id, uint electionId, address wallet);
  event RegisterVoting(address user, uint _electionId, uint _candidateId);
  event CreateElection(string name, uint numberOfCandidates, uint id, uint dateOfCreation, uint dateOfClose);

    function initialize(uint _number) external initializer {
        owner = msg.sender;
        upgradeNumber = _number;
        feeToVote  = 0.1 ether;
    }

  modifier onlyOwner() {
    require(msg.sender == owner, "You are not allowed to do this action");
    _;
  }

  //This function creates an Election with the name of the variable name
  function createElection(string memory _name) public onlyOwner {
    numberOfElections++;
    elections[numberOfElections] = Election(_name, 0, numberOfElections, block.timestamp, block.timestamp + 1 weeks);
    emit CreateElection(_name, 0, numberOfElections, block.timestamp, block.timestamp + 1 weeks);
  }

  //This function adds a candidate to a election
  function addCandidate(string memory _name, uint _electionId ,address _walletAddress) public onlyOwner {
    require(_electionId > 0 && _electionId <= numberOfElections, "The election doesn't exits");
    require(block.timestamp < elections[_electionId].dateOfClose, "Election already closed");
    require(numberOfCandidatesByElection[_electionId] < 5, "There are already 5 candidates");
    numberOfCandidatesByElection[_electionId] = numberOfCandidatesByElection[_electionId] + 1;
    uint numberOfCandidatesInThisElection = numberOfCandidatesByElection[_electionId];
    candidatesByElection[_electionId][numberOfCandidatesInThisElection] = Candidate(_name, 0, numberOfCandidatesInThisElection, _walletAddress);
    elections[_electionId].numberOfCandidates++;
    emit AddCandidate(_name, 0, numberOfCandidatesInThisElection, _electionId, _walletAddress);
  }

  //This function register the user in the contract, the user needs to be registered to vote 
  function register() public payable {
    require(userRegistered[msg.sender] == false, "User already registered");
    require(msg.value == feeToVote, "You need to pay 0.1 ether to vote");
    userRegistered[msg.sender] = true;
    emit Register(msg.sender);
  }

  //This function allows the user to vote for one of the candidates
  function vote(uint _electionId, uint _idOfCandidate) public  {
    require(_idOfCandidate > 0 && _idOfCandidate <= numberOfCandidatesByElection[_electionId], "Candidate doesn't exist");
    require(alreadyVotedInThisElection[_electionId][msg.sender] == false, "Elector already voted in this election");
    require(block.timestamp < elections[_idOfCandidate].dateOfClose, "Election is already closed");
    require(userRegistered[msg.sender] == true, "User is not registered");
    require(candidatesByElection[_electionId][_idOfCandidate].wallet != msg.sender, "A candidate can't vote for himself");

    candidatesByElection[_electionId][_idOfCandidate].votes++;
    alreadyVotedInThisElection[_electionId][msg.sender] = true;
    emit RegisterVoting(msg.sender, _electionId, _idOfCandidate);
    
  }

  //This function allows the owner to get the ether of the contract
  function withdraw()  public onlyOwner payable {
    payable(msg.sender).transfer(address(this).balance);
  }

  //This functions allows the owner to check the balance of the contract
  function contractBalance() public view onlyOwner returns(uint) {
    return address(this).balance;
}

}



