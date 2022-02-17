import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { useParams } from "react-router";

export default function Vote({ contract, currentAccount }) {
	const [numberOfElections, setNumberOfElections] = useState(0);
	const [candidates, setCandidates] = useState([]);
	const [paramsId, setParamsId] = useState(0);
	const [alreadyVoted, setAlreadyVoted] = useState(false);
	const params = useParams();

    // This functions gets the number of elections in the contract
	const getNumberOfElections = async () => {
		let numberOfElections = await contract.numberOfElections();
		setNumberOfElections(numberOfElections.toNumber());
	};

    // This function gets the candidates of the given election
	const getCandidatesOfElection = async () => {
		let numberOfCandidates = await contract.numberOfCandidatesByElection(
			paramsId,
		);
		numberOfCandidates = numberOfCandidates.toNumber();

		let listOfCandidates = [];

		for (let i = 1; i <= numberOfCandidates; i++) {
			let candidate = await contract.candidatesByElection(paramsId, i);
			listOfCandidates.push(candidate);
		}

		listOfCandidates = listOfCandidates.map((candidate) => {
			return {
				name: candidate.name,
				wallet: candidate.wallet,
				id: candidate.id.toNumber(),
				votes: candidate.votes.toNumber(),
			};
		});

		setCandidates(listOfCandidates);
	};

    // This function checks if the user already voted in the given election
	const checkIfAlreadyVoted = async () => {
		let alreadyVoted = await contract.alreadyVotedInThisElection(
			paramsId,
			currentAccount,
		);
		setAlreadyVoted(alreadyVoted);
	};

    // This function allows the user to vote for a candidate in the given election
	const vote = async (idOfCandidate) => {
		let alreadyVoted = await contract.alreadyVotedInThisElection(
			paramsId,
			currentAccount,
		);
		if (!alreadyVoted) {
			await contract.vote(paramsId, idOfCandidate);
		}
	};

	useEffect( () => {
		 setParamsId(params.id);  
	}, []);

	useEffect( () => {
		 checkIfAlreadyVoted();
	}, []);

	useEffect( () => {
		 checkIfAlreadyVoted();
	}, [currentAccount, contract]);

	useEffect( () => {
		 getNumberOfElections();
		 getCandidatesOfElection();
		 checkIfAlreadyVoted();
	}, [contract]);

    // This checks if the election exists
	if (paramsId < 1 || paramsId > numberOfElections)
		return <div>This elections does not exist</div>;

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell align="right">Wallet</TableCell>
						<TableCell align="right">Votes</TableCell>
						<TableCell align="right">Id</TableCell>
						<TableCell align="right">Vote</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{candidates.map((candidate) => (
						<TableRow
							key={candidate.name}
							sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
							<TableCell component="th" scope="row">
								{candidate.name}
							</TableCell>
							<TableCell align="right">{candidate.wallet}</TableCell>
							<TableCell align="right">{candidate.votes}</TableCell>
							<TableCell align="right">{candidate.id}</TableCell>
							<TableCell align="right">
								{(!alreadyVoted && (candidate.wallet !== currentAccount)) ? (
									<Button variant="outlined" onClick={() => vote(candidate.id)}>
										Vote
									</Button>
								) : (
									<Button disabled>You can't vote'</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
