import React from "react";
import Button from "@mui/material/Button";
import { ethers } from "ethers";
import Voting from "../../utils/Voting.json";
import style from "./Home.module.css";

export default function Home({
	registered,
	setRegistered,
	checkIfUserIsRegistered,
    votingAddress
}) {

    // This function registers the user in the contract
	const register = async () => {
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

				await connectedContract.register({
					value: ethers.utils.parseEther("0.1"),
				});
				setRegistered(true);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className={style.container}>
			{!registered ? (
				<Button variant="contained" onClick={() => register()}>
					Register
				</Button>
			) : (
				<Button disabled>You are registered</Button>
			)}
		</div>
	);
}
