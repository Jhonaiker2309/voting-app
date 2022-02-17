import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import style from "./Navbar.module.css";

export default function Navbar() {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar className={style.bar}>
					<Link to="/" className={style.link}>
						<Button color="inherit">Home</Button>
					</Link>
					<Link to="/elections" className={style.link}>
						<Button color="inherit">Elections</Button>
					</Link>
					<Link to="/create-election" className={style.link}>
						<Button color="inherit">Create election</Button>
					</Link>
					<Link to="/add-candidate" className={style.link}>
						<Button color="inherit">Add candidate</Button>
					</Link>
				</Toolbar>
			</AppBar>
		</Box>
	);
}
