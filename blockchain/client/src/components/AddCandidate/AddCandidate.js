import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import style from "./AddCandidate.module.css";

export default function AddCandidate({ contract, currentAccount }) {
	const defaultOption = {
		id: 0,
		name: "Select an election",
	};

	const [id, setId] = useState(0);
	const [elections, setElections] = useState([]);
	const [name, setName] = useState("");
	const [wallet, setWallet] = useState("");
	const [isTheOwner, setIsTheOwner] = useState(false);
    const [owner, setOwner] = useState("")

    //This function sets the id of the election
	const handleChange = (event) => {
		setId(event.target.value);
	};

    // This function gets the elections of the blockchain
	const getElections = async () => {
		let numberOfElections = await contract.numberOfElections();
		let listOfElections = [];
		for (let i = 1; i <= numberOfElections; i++) {
			let currentElection = await contract.elections(i);
			listOfElections.push(currentElection);
		}

		listOfElections = listOfElections.map((election) => {
			return {
				name: election.name,
				id: election.id.toNumber(),
			};
		});

		setElections(listOfElections);
	};

    // This functions adds a candidate to the election selected
	const addCandidate = async () => {
		if (id > 0 && wallet.length > 0 && name.length > 0) {
			await contract.addCandidate(name, id, wallet);
			setId(0);
			setName("");
			setWallet("");
		}
	};

    // this function checks if the user is the owner of the contract
	const checkIfUserIsTheOwner = async () => {
        await getOwner()
		if (owner.toLowerCase() == currentAccount.toLowerCase()) {
			setIsTheOwner(true);
		} else {
			setIsTheOwner(false);
		}
	};

    // This function gets the owner of the contract
    const getOwner = async () => {
      let owner = await contract.owner();
    setOwner(owner.toLowerCase())  
    }

	useEffect( async () => {
		 await checkIfUserIsTheOwner();
         await getElections();
	}, []);

	useEffect( async() => {
		 await getElections();
	}, [contract]);

    useEffect(async () => {
		await checkIfUserIsTheOwner()
	}, [currentAccount]);

	return (
		<div className={style.container}>
			<TextField
				id="outlined-select-currency"
				select
				label="Select"
				value={id}
				onChange={handleChange}
				helperText="Please select your candidate"
				className={style.text}>
				<MenuItem key={defaultOption.id} value={defaultOption.id}>
					{defaultOption.name}
				</MenuItem>
				{elections.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						{option.name}
					</MenuItem>
				))}
			</TextField>
			<TextField
				label="Name of candidate"
				variant="standard"
				className={style.text}
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<TextField
				label="Wallet"
				variant="standard"
				className={style.text}
				value={wallet}
				onChange={(e) => setWallet(e.target.value)}
			/>
			
				<Button variant="outlined" onClick={() => addCandidate()}>
					Add candidate
				</Button>
			
		</div>
	);
}
