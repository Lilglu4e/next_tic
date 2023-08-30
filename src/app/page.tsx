'use client'
import React, { useState, useEffect } from "react";
import { Board } from "./Components/Board";
import ScoreBoard from "./Components/ScoreBoard";
import Dice from './Components/Dice'
import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc } from "firebase/firestore";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import Options from "./Components/Options";
import ControlUnit from "./Components/ControlUnit";
import * as cotl from './Functions/Class';
import './Components/App.css';
import './Components/GameOver.css'


export default function Home() {

	const [playerOne, setPlayerOneBoard] = useState(Array(9).fill(null))
	const [playerTwo, setPlayerTwoBoard] = useState(Array(9).fill(null))
	const [sessionID, setSessionID] = useState("000000");
	const [playerXPlaying, setPlayerxPlayer] = useState(true)
	const [die, setDie] = useState(null)
	const [userName, setUserName] = useState(null)

	const firebaseConfig = {
		apiKey: "AIzaSyBl51OUfM0focTTZ3nFA-TJXq7lgpwehVA",
		authDomain: "cotl-outside.firebaseapp.com",
		projectId: "cotl-outside",
		storageBucket: "cotl-outside.appspot.com",
		messagingSenderId: "958358712279",
		appId: "1:958358712279:web:38683e28882b302c636592",
		measurementId: "G-5N4KQBW16K"
	};

	const app = initializeApp(firebaseConfig);
	const analytics = getAnalytics(app);
	const db = getFirestore(app);

	const AlertSession = () => {
		let ID = prompt("Please enter the session");
		setSessionID(ID);
		localStorage.setItem("userName", "2")
		setUserName("2");
	}

	useEffect(() => {
		// const role = () => {
		//   let userInput = prompt('Enter player name:');;

		//   while (userInput !== '1' && userInput !== '2'){
		//     userInput = prompt('Please enter a valid username :');
		//   }
		//   localStorage.setItem("userName", userInput)
		//   setUserName(userInput)
		// }
		// role()
		localStorage.setItem("userName", "1")
		setUserName("1")
	}, [])

	//Initiating the animation and boardBloker
	useEffect(() => {

		boardBlocker(!playerXPlaying)

	}, [playerXPlaying])
	//

	useEffect(() => {

		rotateDice()

	}, [die])


	useEffect(() => {
		const joinSession = async () => {
			// resetBoard();
			let diemove = Math.floor(Math.random() * 6 + 1)
			const docRef = doc(db, "Sessions", sessionID);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setPlayerOneBoard(docSnap.data().playerone)
				setPlayerTwoBoard(docSnap.data().playertwo)
				setDie(docSnap.data().die)
				setPlayerxPlayer(docSnap.data().playerXPlaying)

			} else {
				// doc.data() will be undefined in this case
				await setDoc(doc(db, "Sessions", sessionID), {
					playerone: playerOne,
					playertwo: playerTwo,
					die: diemove,
					finished: cotl.handleGameOver(playerOne, playerTwo),
					playerXPlaying: true,
					//TODO: 
					//PlayertwoName: "null", // TODO: Get player name 
				});
			}
			setDie(diemove);
		}

		joinSession();
	}, []);



	useEffect(() => {
		const unsub = onSnapshot(doc(db, "Sessions", sessionID), (doc) => {

			setPlayerOneBoard(cotl.sort(doc.data().playerone))
			setPlayerTwoBoard(cotl.sort(doc.data().playertwo))
			setDie(doc.data().die)
			setPlayerxPlayer(doc.data().playerXPlaying)

		})


	}, [sessionID])


	const handleBoxClickPlayerOne = (indx) => {

		if (localStorage.getItem("userName") === "2") {
			return; // If playerTwo is stored in local storage, do nothing and return
		}

		const updateBoard = playerOne.map((value, index) => {
			if (index === indx && playerXPlaying === true) {

				cotl.updateChange(die, index, playerTwo);
				return die;
			} else {
				return value;
			}
		})

		if (playerXPlaying) {
			let diemove = Math.floor(Math.random() * 6 + 1);
			const Ref = doc(db, "Sessions", sessionID);
			updateDoc(Ref, {
				playerone: updateBoard,
				playertwo: playerTwo,
				playerXPlaying: false,
				die: diemove,
			});

		}

	}



	const handleBoxClickPlayerTwo = (indx) => {

		if (localStorage.getItem("userName") === "1") {
			return; // If playerTwo is stored in local storage, do nothing and return
		}

		const updateBoard = playerTwo.map((value, index) => {
			if (index === indx && playerXPlaying === false) {
				cotl.updateChange(die, index, playerOne)

				return die;
			} else {
				return value;
			}
		})

		if (!playerXPlaying) {

			const Ref = doc(db, "Sessions", sessionID);
			let diemove = Math.floor(Math.random() * 6 + 1);

			updateDoc(Ref, {
				playerone: playerOne,
				playertwo: updateBoard,
				playerXPlaying: true,
				die: diemove
			});

		}

	}

	const resetBoard = () => {
		rotateDice();
		const Ref = doc(db, "Sessions", sessionID);
		let diemove = Math.floor(Math.random() * 6 + 1);

		updateDoc(Ref, {
			playerone: Array(9).fill(null),
			playertwo: Array(9).fill(null),
			die: diemove,
			playerXPlaying: true

		});
	}

	// Arshia

	const rotateDice = () => {
		const styles = getComputedStyle(document.body);
		// This section is only to make sure you select the whole dice
		const diceElement = document.getElementsByClassName("dice")[0];

		diceElement.classList.toggle('random-rotation');
		setTimeout(function () {
			diceElement.classList.remove('random-rotation');
		}, 1500);

		// Targeted side
		var facingSide = die;
		var transform = null;

		switch (facingSide) {
			case 1:
				transform = styles.getPropertyValue('--dice-face-one');
				break;
			case 2:
				transform = styles.getPropertyValue('--dice-face-two');
				break;
			case 3:
				transform = styles.getPropertyValue('--dice-face-three');
				break;
			case 4:
				transform = styles.getPropertyValue('--dice-face-four');
				break;
			case 5:
				transform = styles.getPropertyValue('--dice-face-five');
				break;
			case 6:
				transform = styles.getPropertyValue('--dice-face-six');
				break;
			default:
				transform = null;
		}
		diceElement.style = "transform: " + transform + "; transition: all 0.1s ease-out;";
	}

	const mouseHoverTile = (e, enter) => {
		const button = e.target;

		if (button.parentNode.classList.contains("board_blocked")) {
			return 0;
		}
		if (enter) {
			if (button.innerHTML === '') {

				button.setAttribute('content-before', die);
			}
		}
		else {
			button.setAttribute('content-before', '');
		}
	}

	const boardBlocker = (playerXPlaying) => {
		var boardOne = document.getElementsByClassName("board")[0];
		var boardTwo = document.getElementsByClassName("board")[1];

		for (const box of boardOne.childNodes) {
			box.setAttribute('content-before', '')
		}
		for (const box of boardTwo.childNodes) {
			box.setAttribute('content-before', '')
		}
		if (playerXPlaying === true) {
			boardOne.classList.add("board_blocked");
			boardTwo.classList.remove("board_blocked");

			return 0;
		}
		else if (playerXPlaying === false) {
			boardOne.classList.remove("board_blocked");
			boardTwo.classList.add("board_blocked");

			return 0;
		}

		// If boardNo is not declared; it will toggle between boards automatically 
		boardOne.classList.toggle("board_blocked");
		boardTwo.classList.toggle("board_blocked");

	}

	return (
		<>
			{cotl.handleGameOver(playerOne, playerTwo) ? (
				<section className="gameover-section">
					<section className="gameover-container">
						<h1 className="game-decision">{cotl.winner(playerOne, playerTwo)}</h1>
						<section className="button-section">
							<button onClick={resetBoard}>Reset Game</button>
							<button onClick={AlertSession}>Join Game</button>
						</section>
					</section>
				</section>

			) : (<></>)}
			<div className="Game">
				<ScoreBoard names={{ playerOneName: "POne", playerTwoName: "PTwo" }} scores={cotl.updateScore(playerOne, playerTwo)} playerXPlaying={playerXPlaying} ID={sessionID} />
				
				<Board name={"X"} board={playerOne} onClick={handleBoxClickPlayerOne} mouseHoverTile={mouseHoverTile} />
				<Dice rotateDice={rotateDice} />
				<Board name={"O"} board={playerTwo} onClick={handleBoxClickPlayerTwo} mouseHoverTile={mouseHoverTile} />
			</div>
			<Options resetGame={resetBoard} joinGame={AlertSession}/>
		</>

	)
}
