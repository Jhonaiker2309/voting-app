import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import style from "./CreateElection.module.css";

export default function CreateElections({ contract, currentAccount }) {
	const [name, setName] = useState("");
	const [isTheOwner, setIsTheOwner] = useState(false);
    const [owner, setOwner] = useState("")

    // This function creates a election with the given name
	const createElection = async () => {
		if (currentAccount.toLowerCase() !== owner.toLowerCase()) {
			console.log("The owner is the only one who can create elections");
		} else if (name.length === 0) {
			console.log("The election has to have a name");
		} else {
			await contract.createElection(name);
			setName("");
		}
	};

    // This function checks if the user is the owner of the contract
	const checkIfUserIsTheOwner = async () => {
        await getOwner()
		if (owner.toLowerCase() == currentAccount.toLowerCase()) {
			setIsTheOwner(true);
		} else {
			setIsTheOwner(false);
		}
	};

    //this function gets the owner of the contract
    const getOwner = async () => {
      let owner = await contract.owner();
      setOwner(owner.toLowerCase())
    }

    useEffect(async ()=> {
      await checkIfUserIsTheOwner();
    },[]) 

    useEffect(async () => {
		 await checkIfUserIsTheOwner();
	}, [currentAccount]);
    
	return (
		<div className={style.container}>
			<div className={style.text}>
				<TextField
					label="Name of election"
					variant="standard"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</div>
				<Button variant="outlined" onClick={() => createElection()}>
					Create election
				</Button>		
		</div>
	);
}
