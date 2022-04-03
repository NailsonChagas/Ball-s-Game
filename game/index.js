import Player from "./player.js";
import Projectile from "./projectile.js";
import Enemy  from "./enemy.js";

//selecionar canvas
const CANVAS = document.getElementById('canvas_element');

//criar contexto do canvas
const CTX = CANVAS.getContext('2d');

//Tamanho do canvas será o tamanho da tela
CANVAS.width = window.innerWidth;
CANVAS.height = window.innerHeight;

//iniciando player
const X = CANVAS.width/2;
const Y = CANVAS.height/2;
const PLAYER = new Player(X, Y, 30, 'blue');

//projeteis e inimigos
const PROJECTILES = [];
const ENEMIES = [];

function spawnEnemies(){
    setInterval(() => {
        let radius = Math.random() * (30 - 4) + 4; // de 4px a 30px
        let x;
        let y;

        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : CANVAS.width + 30;
            y = Math.random() * CANVAS.height;
        }
        else{
            x = Math.random() * CANVAS.width;
            y = Math.random() < 0.5 ? 0 - radius : CANVAS.height + 30;
        }
        
        let color = 'green'

        let angle = Math.atan2(
            Y - y,
            X - x,
        );
    
        let velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        ENEMIES.push(new Enemy(
            x, y, radius, color, velocity
        ))
    }, 1000);
}

let animationID;
function animate(){ //loop do jogo
    animationID = requestAnimationFrame(animate);
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    
    PLAYER.draw(CTX);
    
    PROJECTILES.forEach((projectile) => {
        projectile.update(CTX);
    });
    
    ENEMIES.forEach((enemy, idxE) => {
        enemy.update(CTX);

        let distP = Math.hypot(PLAYER.x - enemy.x, PLAYER.y - enemy.y);

        //colisão com player = fim
        if(distP - enemy.radius - PLAYER.radius < 1){
            console.log("colisão");
            cancelAnimationFrame(animationID);
        }

        PROJECTILES.forEach((projectile, idxP) => {
            let dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            //colisão com projetil
            if(dist - enemy.radius - projectile.radius < 1){
                
                setTimeout(() => { //usando para impedir ser apagado antes de ser desenhado
                    ENEMIES.splice(idxE, 1);
                    PROJECTILES.splice(idxP, 1);
                }, 0)
                
            }
        })
    });


}


//inserindo leitor de evento na página
window.addEventListener("click", (event) => {
    let angle = Math.atan2(
        event.clientY - Y,
        event.clientX - X,
    );

    let velocity = {
        x: Math.cos(angle) * 3,
        y: Math.sin(angle) * 3
    }
   
    //a cada clique gerar um projetil
    PROJECTILES.push(
        new Projectile(
            X, Y, 5, 
            'red', 
            velocity
        )
    );
    
});

animate();
spawnEnemies();