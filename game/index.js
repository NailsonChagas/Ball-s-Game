import Player from "./player.js";
import Projectile from "./projectile.js";
import Enemy  from "./enemy.js";
import Particle from "./particle.js";

const START = document.getElementById("start");
const MODAL = document.getElementById("modelEl");

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


let score = 0; //adicionar sistema de score (falta escrever no canvas)
const SCORE = document.getElementById("score");
const BScore = document.getElementById("BScore");

//player, projeteis, particulas e inimigos
let PLAYER = new Player(X, Y, 30, 'white');
let PROJECTILES = [];
let PARTICLES = [];
let ENEMIES = [];

function init(){
    PLAYER = new Player(X, Y, 30, 'white');
    PROJECTILES = [];
    PARTICLES = [];
    ENEMIES = [];
    score = 0;
    SCORE.innerText = score;
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
}

function spawnEnemies(){
    setInterval(() => {
        let radius = Math.random() * (50 - 7) + 7; // de 7px a 50px
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
        
        let color = `hsl(${Math.random() * 360}, 50%, 50%)`

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
    console.log(score)

    CTX.fillStyle = 'rgba(0,0,0, 0.2)'
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
    
    PLAYER.draw(CTX);

    //desenhar particulas
    PARTICLES.forEach((particle, idx) => {
        if(particle.alpha <=0){
            PARTICLES.splice(idx, 1)
        }
        else{
            particle.update(CTX);
        }
    });
    
    PROJECTILES.forEach((projectile, idxP) => {
        let dist = Math.hypot(projectile.x - PLAYER.x, projectile.y - PLAYER.y);

        projectile.update(CTX);
        
        if(
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > CANVAS.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > CANVAS.height
        ){ //apagando projeiteis fora da tela
            setTimeout(() => { //usando para impedir ser apagado antes de ser desenhado
                PROJECTILES.splice(idxP, 1);
            }, 0)
        }

        if((dist - projectile.radius - PLAYER.radius < 1) && projectile.hits !=2){ //colisão player projetil
            if(projectile.hits < 2){
                score += 10;
                SCORE.innerText = score; //mudando valor do score no html
            }
            setTimeout(() => { //usando para impedir ser apagado antes de ser desenhado
                PROJECTILES.splice(idxP, 1);
            }, 0)
        }


    });
    
    ENEMIES.forEach((enemy, idxE) => {
        enemy.update(CTX);

        let distP = Math.hypot(PLAYER.x - enemy.x, PLAYER.y - enemy.y);

        //colisão com player = fim
        if(distP - enemy.radius - PLAYER.radius < 1){
            cancelAnimationFrame(animationID);
            MODAL.style.display = 'flex';
            BScore.innerText = score;
        }

        PROJECTILES.forEach((projectile, idxP) => {
            let dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            //colisão com projetil
            if(dist - enemy.radius - projectile.radius < 1){
                projectile.hits -= 1;
                projectile.radius /= 2;

                //particulas
                for(let i = 0; i < enemy.radius * 2; i++){
                    PARTICLES.push(new Particle(
                            projectile.x, 
                            projectile.y,
                            Math.random() * 3,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 5),
                                y: (Math.random() - 0.5) * (Math.random() * 5),
                            }
                        )
                    );
                }


                setTimeout(() => { //usando para impedir ser apagado antes de ser desenhado
                    if(enemy.radius - 10 > 5){
                        //usando gsap para fazer uma interpolação
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        });
                        
                    }
                    else{
                        ENEMIES.splice(idxE, 1);
                    }
                    

                    if(projectile.hits == 0){
                        PROJECTILES.splice(idxP, 1);
                    }
                    else{
                        projectile.color = enemy.color;
                        projectile.velocity.x = projectile.velocity.x * -1.5;
                        projectile.velocity.y = projectile.velocity.y * -1.5;
                    }
                    
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
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
   
    //a cada clique gerar um projetil
    PROJECTILES.push(
        new Projectile(
            X, Y, 5, 
            'white', 
            velocity
        )
    );
    
});


START.addEventListener("click", (event) => {
    MODAL.style.display = 'none';
    init();
    animate();
    spawnEnemies();
});

