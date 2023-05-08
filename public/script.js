const socket = io(); // create new instance
let currentTurn = "X"
let opponentName;
let gameOver = false;
let yourPiece;
let gameWinner = false;
let gameStarted = false;
let board = [["","",""],["","",""],["","",""]];

let possibleWins = [
    ["00", "01", "02"],
    ["10", "11", "12"],
    ["20", "21", "22"],
    ["00", "10", "20"],
    ["01", "11", "21"],
    ["02", "12", "22"],
    ["00", "11", "22"],
    ["02", "11", "20"]
]

const players = { "X": "O", "O": "X" };

function yxFromId(id){
    return [parseInt(id[0]), parseInt(id[1])]
}

function joining() {
    let username = prompt("What is your username?");
    let room = prompt("What room would you like to join?");
    socket.emit("joined", username, room);
}

joining();

let opponentPiece;

function updateTurn(board, possibleWins){
    console.log(board)
    let isWinner = winner(board, possibleWins);
    console.log(isWinner);
    let turnDiv = document.getElementById("turn");
    if (isWinner){
        gameOver = true;
        turnDiv.innerText = isWinner;
        let boardPositions = document.querySelectorAll(".empty-tic-tac-toe");
        boardPositions.forEach(piece => {
            piece.classList.remove("empty-tic-tac-toe");
            piece.classList.add("done-tic-tac-toe");
        })
        return;
    }
    if (currentTurn === yourPiece){
        turnDiv.innerText = "Your turn!"
        let boardPositions = document.querySelectorAll(".done-tic-tac-toe");
        boardPositions.forEach(piece => {
            piece.classList.remove("done-tic-tac-toe");
            piece.classList.add("empty-tic-tac-toe");
        })
    } else{
        turnDiv.innerText = "Waiting for opponent...";
        let boardPositions = document.querySelectorAll(".empty-tic-tac-toe");
        boardPositions.forEach(piece => {
            piece.classList.remove("empty-tic-tac-toe");
            piece.classList.add("done-tic-tac-toe");
        })
        
    }
}

function fetchNum(board, spot){
    let yx = yxFromId(spot);
    return board[yx[0]][yx[1]]
}

function winner(board, possibleWins){
  for(let a=0; a<2; a++){
    let player = "XO"[a]
    for(let b=0; b<possibleWins.length; b++){
      let possibleWin = possibleWins[b];
      let broke = false;
      for(let c=0; c<possibleWin.length; c++){
        let spot = possibleWin[c];
        if (!(fetchNum(board, spot) === player)){broke=true; break}
        
        
      }
      if (!broke){return player + " wins!"}
    }
  }
  for(let d=0; d<board.length; d++){
    let row = board[d];
    for(let e=0; e<row.length; e++){
      let col = row[e];
      if (col === ""){return}
    }
  }
  return "Cat's game!"
}

function setup_things() {
    let boardPieces = Array.from(document.querySelectorAll(".empty-tic-tac-toe"));
    boardPieces.forEach(boardPiece => {

        let id = boardPiece.id;
        boardPiece.innerHTML = yourPiece;
        boardPiece.addEventListener("click", () => {
            if (!gameWinner && !(document.getElementById(id).classList.contains("full-tic-tac-toe")) && !gameOver) {
                if ((currentTurn === yourPiece) && (gameStarted)) {
                    socket.emit("made-move", id);
                    let el = document.getElementById(id);
                    el.innerText = yourPiece;
                    el.classList.remove("empty-tic-tac-toe")
                    let yx = yxFromId(id);
                    let y = yx[0];
                    let x = yx[1];
                    board[y][x] = yourPiece;
                    currentTurn = players[currentTurn]
                    updateTurn(board, possibleWins)
                    el.classList.add("full-tic-tac-toe")
                    el.classList.remove("done-tic-tac-toe", "empty-tic-tac-toe")
                    
                }
            }
        })
    })
}


socket.on("you-joined", (piece) => {
    yourPiece = piece;
    opponentPiece = players[piece];
    setup_things();
    if (piece === "O") {
        gameStarted = true;
    }
    updateTurn(board, possibleWins)
})

socket.on("joined", (name) => {
    opponentName = name;
    gameStarted = true;
    alert("Your opponent, " + name + ", has joined the game.");
})

socket.on("failed", () => {
    alert("That room is full. Please try again.")
    joining()
})
socket.on("made-move", id => {
    currentTurn = players[currentTurn]
    let yx = yxFromId(id);
    let y = yx[0];
    let x = yx[1];
    board[y][x] = opponentPiece;
    let place = document.getElementById(id);
    place.innerText = opponentPiece;
    updateTurn(board, possibleWins)
    
    place.classList.remove("empty-tic-tac-toe")
    place.classList.remove("done-tic-tac-toe")
    place.classList.add("full-tic-tac-toe")
    
})

socket.on("disconnection", (reason) => {
    alert("Opponent disconnected.")
})