import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Voting from "./utils/Voting.json";
import Navbar from "./components/Navbar/Navbar.js";
import AddCandidate from "./components/AddCandidate/AddCandidate.js";
import Elections from "./components/Elections/Elections.js";
import CreateElections from "./components/CreateElections/CreateElections.js";
import Button from "@mui/material/Button";
import Home from "./components/Home/Home.js";
import Vote from "./components/Vote/Vote.js";
import "./App.css";
import dotenv from ("dotenv")
import { BrowserRouter, Routes, Route } from "react-router-dom";

dotenv.config()

const App = () => {
	const votingAddress = process.env.votingAddress;
	const [currentAccount, setCurrentAccount] = useState("");
	const [contract, setContract] = useState({});
	const [registered, setRegistered] = useState(false);

    // This function gets the contract of the blockchain
	const getContract = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					votingAddress,
					Voting.abi,
					signer,
				);

				setContract(connectedContract);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

    //This function checks if the user has a metamask account connected
	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have metamask!");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}
	};

    //This functions checks if the user is connected in the contract
	const checkIfUserIsRegistered = async () => {
		let userRegistered = await contract.userRegistered(currentAccount);
		setRegistered(userRegistered);
	};

    //This function changes the account of the metamask account
    const changeAccount = async () => {
      		window.ethereum.on("accountsChanged", async () => {
			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log("Found an authorized account:", account);
				setCurrentAccount(account);
			} else {
				console.log("No authorized account found");
			}
		});
    }

    //This functions changes a timestamp for a normal date
	const timestampToDate = (timestamp) => {
		let date = new Date(timestamp * 1000);
		let dateString = date.toGMTString();
		return dateString;
	};

    // This function allows the user to connect his wallet to the front end
	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}


			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});


			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

    // This function allows the front end to read the emits of the contract
	const setupEventListener = async () => {
		
		try {
			const { ethereum } = window;

			if (ethereum) {
				
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					votingAddress,
					Voting.abi,
					signer,
				);

				connectedContract.on("Register", (user) => {
					console.log("User: ", user, " registered");
				});

				connectedContract.on(
					"CreateElection",
					(name, numberOfCandidates, id, dateOfCreations, dateOfClose) => {
						let data = {
							name,
							numberOfCandidates: numberOfCandidates.toNumber(),
							id: id.toNumber(),
							dateOfCreations: timestampToDate(dateOfCreations.toNumber()),
							dateOfClose: timestampToDate(dateOfClose.toNumber()),
						};
						console.log(data);
					},
				);

				connectedContract.on(
					"AddCandidate",
					(user, electionId, candidateId) => {
						let data = {
							user,
							electionId: electionId.toNumber(),
							candidateId: candidateId.toNumber(),
						};
						console.log(data);
					},
				);

				connectedContract.on(
					"RegisterVoting",
					(name, numberOfCandidates, id, dateOfCreation, dateOfClose) => {
						let data = {
							name,
							numberOfCandidates: numberOfCandidates.toNumber(),
							id: id.toNumber(),
							dateOfCreation: timestampToDate(dateOfCreation.toNumber()),
							dateOfClose: timestampToDate(dateOfClose.toNumber()),
						};
						console.log(data);
					},
				);

				console.log("Setup event listener!");
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		} 
	};

	// Render Methods

	useEffect( () => {
		 getContract();
		 checkIfWalletIsConnected();
		 setupEventListener();
         checkIfUserIsRegistered();
         changeAccount()
	}, []);

	useEffect(async () => {
		 checkIfUserIsRegistered();
	}, [contract, currentAccount]);

    // This function shows a button that allows the user to connect his wallet to the front end
	const renderNotConnectedContainer = () => (
		<Button variant="contained" onClick={connectWallet} className="button">
			Connect to Wallet
		</Button>
	);

	return (
		<div className="App">
			<BrowserRouter>
				<div className="container">
					<div className="header-container">
						<Navbar />
						<Routes>
							<Route
								path="/"
								element={
									<Home
										registered={registered}
										setRegistered={setRegistered}
										checkIfUserIsRegistered={checkIfUserIsRegistered}
                                        votingAddress={votingAddress}
									/>
								}
							/>
							<Route
								path="/elections"
								element={<Elections contract={contract} />}
							/>
							<Route
								path="/create-election"
								element={
									<CreateElections
										contract={contract}
										currentAccount={currentAccount}
									/>
								}
							/>
							<Route
								path="/add-candidate"
								element={
									<AddCandidate
										contract={contract}
										currentAccount={currentAccount}
									/>
								}
							/>
							<Route
								path="/voting/:id"
								element={
									<Vote contract={contract} currentAccount={currentAccount} />
								}
							/>
						</Routes>

						{currentAccount === "" ? renderNotConnectedContainer() : null}
					</div>
				</div>
			</BrowserRouter>
		</div>
	);
};

export default App;
