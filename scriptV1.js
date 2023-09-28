
window.onload = function(){
//quand la fenetre est chargée
    let canvasWidth = 900;
    let canvasHeight = 600;
    let blockSize = 30;
    let ctx;
    let delay = 50;
    let snaky;
    let apple;
    let widthInBlocks = canvasWidth/blockSize;
    let heightInBlocks = canvasHeight/blockSize;
    let score;
    let timeout;
    init();


    function init(){ 
        // Créer éléments HTML
        let canvas = document.createElement('canvas');
        // HTML et CSS des éléments
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "20px solid black";
        canvas.style.margin = "50px auto";
        canvas.style.display = 'block';
        canvas.style.backgroundColor = "gray" 
        // attacher les éléments au body HTML
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        snaky = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4],[1,4]], "right")
        apple = new Apple([10,10])
        score = 0;
        
        refreshCanvas();
    };


    function refreshCanvas(){
        snaky.move();
        if(snaky.checkCollision()){
            gameOver();
        }else{
            // dessiner le serpent à l'intérieur du canvas avec ctx
            if(snaky.isEatingApple(apple)){
                score ++;
                do{
                    snaky.ateApple = true;
                    apple.newApplePosition();
                }while(apple.isOnSnake(snaky))
            }
            ctx.clearRect(0,0, canvasWidth, canvasHeight);
            drawScore();
            snaky.draw();
            apple.draw();
            timeout = setTimeout(refreshCanvas, delay)
        }
    };


    function drawBlock(ctx, position){
        let x = position[0] * blockSize;
        let y = position[1] * blockSize;
        ctx.fillRect(x,y,blockSize,blockSize) 
        // rectangle(x,y,largeur,longueur)
    };

    function gameOver(){
        ctx.save();
        ctx.font = "bold 50px sans-serif"; // police
        ctx.fillStyle = "black"; // couleur
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.strokeStyle = "white";
        ctx.lineWidth = "5";
        ctx.strokeText("Game Over", (canvasWidth/2), (canvasHeight/2)-200);
        ctx.fillText("Game Over", (canvasWidth/2), (canvasHeight/2)-200); //texte à écrire, x, y du canvas
        ctx.font = "bold 30px sans-serif"; // police
        ctx.strokeText("Appuyer sur ENTER pour rejouer !", (canvasWidth/2), (canvasHeight/2)-140);
        ctx.fillText("Appuyer sur ENTER pour rejouer !", (canvasWidth/2), (canvasHeight/2)-140)
        ctx.restore();
    }

    function restart(){
        snaky = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4],[1,4]], "right")
        apple = new Apple([10,10])
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }

    function drawScore(){
        ctx.save();
        ctx.font = "bold 200px sans-serif"; // police
        ctx.fillStyle = "rgba(0,0,0, 0.3)"; // couleur
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(score.toString(), (canvasWidth/2), (canvasHeight/2)); 
        ctx.restore();
    }


    // ----------------- Fonction prototype du serpent ---------------------------
    function Snake(body, direction){
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function(){
                ctx.save();
                ctx.fillStyle = "#ff0000";
                for(let i = 0; i<this.body.length; i++){
                    drawBlock(ctx, this.body[i]);
                }
                ctx.restore();
            };
        
        this.move = function(){
            let nextPosition = this.body[0].slice();
            //copie le premier élément du body (tête)
            switch(this.direction){
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("Invalid Direction");
                }
            this.body.unshift(nextPosition); //premier élément de la tete+1
            if(!this.ateApple){
                this.body.pop();
            }else{
                this.ateApple=false;
            }  
        };

        this.setDirection = function(newDirection){
            let allowDirections;
            switch(this.direction){
                case "left":
                case "right":
                    allowDirections =["up", "down"];
                    break;
                case "down":
                case "up":
                    allowDirections =["left", "right"];
                    break;
                default:
                    throw("Invalid Direction");
            }
            if(allowDirections.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        }
        this.checkCollision = function(){
            let wallCollision = false;
            let snakeCollision = false;
            let head = this.body[0];
            let restBody = this.body.slice(1); // tout sauf 0, donc la tête
            let headX = head[0];
            let headY = head[1];
            let minX = 0;
            let minY = 0;
            let maxX = widthInBlocks - 1;
            let maxY = heightInBlocks -1;
            let notBetweenHorizontalWalls = headX < minX || headX > maxX;
            let notBetweenVerticalWalls = headY < minY || headY > maxY;
            if (notBetweenHorizontalWalls || notBetweenVerticalWalls){
                wallCollision = true;
            }
            for(let i = 0; i < restBody.length ; i++){
                if(headX === restBody[i][0] && headY === restBody[i][1]){
                    snakeCollision = true;
                }; // on vérifie si la tête n'est pas sur même x et y (même case)
            }
            return wallCollision || snakeCollision;
        }
        this.isEatingApple = function(appleToEat){
            let head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else
                return false;
        }
    }
    document.onkeydown = function HandleKeyDown(event){
        let key = event.key;
        let newDirection;
        switch(key){
            case "ArrowRight":
                newDirection = "right"
            break;
            case "ArrowLeft":
                newDirection = "left"
            break;
            case "ArrowUp":
                newDirection = "up"
            break;
            case "ArrowDown":
                newDirection = "down"
            break;
            case "Enter":
                restart();
                return;
            default:
                return;
            
        }
        snaky.setDirection(newDirection);
    }

    // ----------------- Fonction prototype de la pomme ---------------------------
    function Apple(position){
        this.position = position;
        this.draw = function(){
            ctx.save();
            //a chaque fois avant d'utiliser le ctx on le save pour le rafraischissement
            ctx.fillStyle = 'yellow'
            ctx.beginPath();
            let radius = blockSize/2;
            let x = this.position[0]*blockSize + radius;
            let y = this.position[1]*blockSize + radius;
            ctx.arc(x,y,radius, 0, Math.PI*2, true); // fonction pour dessiner un cercle
            ctx.fill();
            ctx.restore();
        };
        this.newApplePosition = function(){
            let newX = Math.round(Math.random() * (widthInBlocks - 1));
            let newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        // Empecher que la nvle pomme apparaisse sur le body du snake
        this.isOnSnake = function(checkSnakeBody){
            let isOnSnake = false;
            for(let i = 0; i < checkSnakeBody.body.length; i++){
                if(this.position[0] === checkSnakeBody.body[i][0] && this.position[1] === checkSnakeBody.body[i][1]){
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        }
    }
}
