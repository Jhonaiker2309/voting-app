import React, {useState, useEffect} from 'react'
import {useNavigate} from "react-router-dom"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import style from "./Elections.module.css"


export default function AddCandidate({contract}) {

  const defaultOption = {
    id: 0,
    name: "Select an election"
  }

  let navigate = useNavigate();

 const [id, setId] = useState(0);
 const [elections, setElections] = useState([])


    // This function gets the id of the given election
    const handleChange = (event) => {
    setId(event.target.value);
  };

  // This function gets the elections of the contract
  const getElections = async () => {
    let numberOfElections = await contract.numberOfElections()
    let listOfElections = []
    for(let i = 1; i <= numberOfElections; i++){
      let currentElection = await contract.elections(i)
      listOfElections.push(currentElection)
    }

    listOfElections = listOfElections.map(election => {
      return {
        name: election.name,
        id: election.id.toNumber()
      }
    })

    setElections(listOfElections)
  }

  // This function sends the user to the voting page
  const goToElection = async () => {
    
      if(id > 0){
        return navigate(`/voting/${id}`)
      }
    }
  

    useEffect( ()=> {
     getElections()
  }, [contract])

    useEffect( ()=> {
     getElections()
  }, [])
 
  return (
    <div className={style.container}>
        <TextField
          id="outlined-select-currency"
          select
          label="Select"
          value={id}
          onChange={handleChange}
          helperText="Please select your candidate"
          className={style.text}
        >
            <MenuItem key={defaultOption.id} value={defaultOption.id}>
              {defaultOption.name}
            </MenuItem>
        {elections.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
      <Button variant="outlined" onClick={()=> goToElection()}>Go to election</Button> 
    </div>
  )
}
