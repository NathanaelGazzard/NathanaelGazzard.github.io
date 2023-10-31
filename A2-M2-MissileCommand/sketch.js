let stateManager = 0;//this int will be used throughout to control transitions between screens

let boxArtIMG, logoIMG, backgroundIMG, midgroundIMG, screenOverlayIMG, bombIMG, invisibleIMG, cityIMG;
let ammoIcon, crosshairIcon;
let turretSpriteSheet, destroyedTurretSpriteSheet, bomberSpriteSheet, missileSpriteSheet, nukeSpriteSheet, truckSpriteSheet, fireSpriteSheet, explosionSpriteSheet, reloadingSpriteSheet, cityBurningSpriteSheet;
let turretAnim, destroyedTurretAnim, bomberAnim, missileAnim, nukeAnim, truckAnim, explosionAnim, reloadingAnim, cityAnim, cityBurningAnim;

let introCutscene;//intro video

let turretObjs = [];
let nukeObjs = [];
let missileObjs = [];
let truckObjs = [];
let bomberObjs = [];
let bombObjs = [];
let cityObjs = [];
let highscoreObjs = [];

let explosionSprites;

let activeTurret = 1;

//these values control the frequency of events such as nukes spawning and ammo deliveries
let timerRate = 1;
let nukeTimer = 0; 
let truckTimer = 0;
let spawnThreshHold = 180;
let nukeCounter = 0;

let nukeTargets = [];//contains all the city and turret objects which are then targeted by the nukes. The nukes will only select targets that have not already been destroyed

let doomCounter = 0;//this is incremented each time a city is destroyed. If all citys are detroyed, game over. 
let transitionDelay = 0;

let deathToll = 0;
let score = 0;//score is increased by time survived, nukes destroyed and bombers shot down
let scoreCounter =0;
let highscoreData = [];//this is the data read from the JSON file. It is used to populate the 'highscoreObjs' array
let playerName = [0,0,0];//these numbers are used to reference the characters in the 'avaiableCharacters' array (below)
let availableCharacters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
let playerNameIndexToggle = 0;//used to set which of the 3 letters are being set
let newHighScore = false;
let canTransition = false;
let scoreRank = 0;

let menuSwitch = 0;
let textOpacity = 255;
let textOpacityIncriment = 4;

let music, buttonSFX, missileLaunchSFX, missileExplosionSFX, bombExplosionSFX, nukeExplosionSFX;

let menuButton;

//these are filled from .txt files
let noteFromCreator;
let tacticalBriefing;



function preload(){
  highscoreData = loadJSON('Assets/Highscores.json');

  boxArtIMG = loadImage('Assets/MissileCommand_BoxArt.png');
  logoIMG = loadImage('Assets/Logo.png');
  backgroundIMG = loadImage('Assets/Background.png');
  midgroundIMG = loadImage('Assets/Midground.png');
  screenOverlayIMG = loadImage('Assets/ScreenCRT_Overlay.png');
  bombIMG = loadImage('Assets/Bomb.png');
  invisibleIMG = loadImage('Assets/Invisible.png');
  ammoIcon = loadImage('Assets/Ammo_Icon.png');
  crosshairIcon = loadImage('Assets/Crosshair_Icon.png');
  cityIMG = loadImage('Assets/Moscow_Pixel.png');

  turretSpriteSheet = loadSpriteSheet('Assets/Turret_SpriteSheet.png', 128, 128, 37);
  destroyedTurretSpriteSheet = loadSpriteSheet('Assets/DestroyedTurret_SpriteSheet.png', 128, 128, 12);
  bomberSpriteSheet = loadSpriteSheet('Assets/Bomber_SpriteSheet.png', 150, 150, 36);
  missileSpriteSheet = loadSpriteSheet('Assets/Missile_SpriteSheet.png', 64, 64, 16);
  nukeSpriteSheet = loadSpriteSheet('Assets/Nuke_SpriteSheet.png', 100, 100, 18);
  truckSpriteSheet = loadSpriteSheet('Assets/Truck_SpriteSheet.png', 150, 150, 6);
  explosionSpriteSheet = loadSpriteSheet('Assets/Explosion_SpriteSheet.png', 100, 100, 48);
  bombExplosionSpriteSheet = loadSpriteSheet('Assets/BombExplosion_SpriteSheet.png', 100, 100, 36);
  nukeExplosionSpriteSheet = loadSpriteSheet('Assets/NukeExplosion_SpriteSheet.png', 200, 200, 36);
  reloadingSpriteSheet = loadSpriteSheet('Assets/Reloading_SpriteSheet.png', 64, 64, 8);
  cityBurningSpriteSheet = loadSpriteSheet('Assets/MoscowBurning_SpriteSheet.png', 256, 128, 16);

  turretAnim = loadAnimation (turretSpriteSheet);
  destroyedTurretAnim = loadAnimation(destroyedTurretSpriteSheet);
  bomberAnim = loadAnimation (bomberSpriteSheet);
  missileAnim = loadAnimation (missileSpriteSheet);
  nukeAnim = loadAnimation (nukeSpriteSheet);
  truckAnim = loadAnimation(truckSpriteSheet);
  explosionAnim = loadAnimation(explosionSpriteSheet);
  bombExplosionAnim = loadAnimation(bombExplosionSpriteSheet);
  nukeExplosionAnim = loadAnimation(nukeExplosionSpriteSheet);
  reloadingAnim = loadAnimation(reloadingSpriteSheet);

  cityAnim = loadAnimation(cityIMG,cityIMG);//wanted to make seperate sprites for each city - did not have time in the end
  cityBurningAnim = loadAnimation(cityBurningSpriteSheet);

  introCutscene = createVideo('Assets/IntroCutscene_LowRes1600x900_VolumeBoosted.mp4');

  music = loadSound('Assets/Basecamp Audio - Epic Industrial Orchestral MetalRock - Grim.mp3');
  buttonSFX = loadSound('Assets/Click_Sound.wav');
  missileLaunchSFX = loadSound('Assets/MissileLaunch_Sound.mp3');
  missileExplosionSFX = loadSound('Assets/MissileExplosion_Sound.mp3');
  bombExplosionSFX = loadSound('Assets/BombExplosion_Sound.mp3');
  nukeExplosionSFX = loadSound('Assets/NukeExplosion_Sound.mp3');

  noteFromCreator = loadStrings('Assets/Note From Creator.txt');
  tacticalBriefing = loadStrings('Assets/Tactical Briefing.txt');
}



function setup(){
  createCanvas(1600, 900);  
  background(0);

  explosionSprites = new Group();
  
  introCutscene.hide();
  introCutscene.onended(cutsceneEnded);

  setupCities();
  setupTurrets();

  textFont('Monaco');

  //populates the highscore objects array from the JSON ifle object
  for(i = 0; i < 30; i++){
    highscoreObjs[i] = highscoreData[i];
  }

  menuButton = createButton('menu');
  menuButton.position(width - 55, 5);
  menuButton.mousePressed(backToMenu);
}


//creates the 3 turret objects and pushes them to the turretObjs array
function setupTurrets(){
  turretObjs = [{
    pos : createVector(50, height - 320),
    isDestroyed : false,
    animFrame : 18,
    animFrameMin : 18,
    animFrameMax : 35,
    sprite : createSprite(50, height - 320, 128, 128),
    anim : turretAnim,
    destroyedAnim : destroyedTurretAnim,
    ammo : 8,
    volleyAmmo : 4,
    cooldown : 120,
    canFire : true,
    ammoIcons : 12,
    reloadingSprite : createSprite(50, height - 320)
  },{
    pos : createVector(width/2, height - 320),
    isDestroyed : false,
    animFrame : 18,
    animFrameMin : 0,
    animFrameMax : 35,
    sprite : createSprite(width/2, height - 320, 128, 128),
    anim : turretAnim,
    destroyedAnim : destroyedTurretAnim,
    ammo : 8,
    volleyAmmo : 4,
    cooldown : 120,
    canFire : true,
    ammoIcons : 12,
    reloadingSprite : createSprite(width/2, height - 320)
  },{
    pos : createVector(width - 50, height - 320),
    isDestroyed : false,
    animFrame : 18,
    animFrameMin : 0,
    animFrameMax : 18,
    sprite : createSprite(width-50, height - 320, 128, 128),
    anim : turretAnim,
    destroyedAnim : destroyedTurretAnim,
    ammo : 8,
    volleyAmmo : 4,
    cooldown : 120,
    canFire : true,
    ammoIcons : 12,
    reloadingSprite : createSprite(width - 50, height - 320)
  }]
  for(i = 0; i < turretObjs.length; i++){
    turretObjs[i].sprite.setCollider("circle", 0, 0, 30);
    turretObjs[i].sprite.addImage(invisibleIMG);
    turretObjs[i].reloadingSprite.addAnimation('reloadAnim', reloadingAnim);
    nukeTargets.push(turretObjs[i]);
  }
}



//creates the 4 city objects and pushes them to the cityObjs array
function setupCities(){
  let moscow = {
    sprite : createSprite(300, 705),
    pos : createVector(300, 705),
    isBurning : false,
    isDestroyed : false,
    population : 11503501,
    burningTime : 180
  }
  moscow.sprite.setCollider('circle', 0, 20, 40);
  moscow.sprite.addAnimation('city', cityAnim);
  moscow.sprite.addAnimation('cityDest', cityBurningAnim);
  moscow.sprite.changeAnimation('city');

  let yekaterinburg = {
    sprite : createSprite(580, 705),
    pos : createVector(580, 705),
    isBurning : false,
    isDestroyed : false,
    population : 1495066,
    burningTime : 180
  }
  yekaterinburg.sprite.setCollider('circle', 0, 20, 40);
  yekaterinburg.sprite.addAnimation('city', cityAnim);
  yekaterinburg.sprite.addAnimation('cityDest', cityBurningAnim);
  yekaterinburg.sprite.changeAnimation('city');

  let novosibirsk = {
    sprite : createSprite(width - 580, 705),
    pos : createVector(width - 580, 705),
    isBurning : false,
    isDestroyed : false,
    population : 1620162,
    burningTime : 180
  }
  novosibirsk.sprite.setCollider('circle', 0, 20, 40);
  novosibirsk.sprite.addAnimation('city', cityAnim);
  novosibirsk.sprite.addAnimation('cityDest', cityBurningAnim);
  novosibirsk.sprite.changeAnimation('city');

  let saintpetersburg = {
    sprite : createSprite(width - 300, 705),
    pos : createVector(width - 300, 705),
    isBurning : false,
    isDestroyed : false,
    population : 4879566,
    burningTime : 180
  }
  saintpetersburg.sprite.setCollider('circle', 0, 20, 40);
  saintpetersburg.sprite.addAnimation('city', cityAnim);
  saintpetersburg.sprite.addAnimation('cityDest', cityBurningAnim);
  saintpetersburg.sprite.changeAnimation('city');

  cityObjs.push(moscow, yekaterinburg, novosibirsk, saintpetersburg);
  nukeTargets.push(moscow, yekaterinburg, novosibirsk, saintpetersburg);
}



//handles all my keybord inputs based on what game state the stateManager is in
function keyPressed() {
  //just checks to see if any button has been pressed
  if(stateManager == 0){
    stateManager = 1;
  }
  //controls main menu navigation
  else if(stateManager == 3){
    if(keyCode === UP_ARROW){
      buttonSFX.play();
      menuSwitch --;
      if(menuSwitch < 0){
        menuSwitch = 2;
      }
    }else if(keyCode === DOWN_ARROW){
      buttonSFX.play();
      menuSwitch ++;
      if(menuSwitch > 2){
        menuSwitch = 0;
      }
    }else if(keyCode === ENTER){
      buttonSFX.play();
      switch(menuSwitch) {
        case 0:
          stateManager = 4;
          break;
        case 1:
          stateManager = 7;
          break;
        default:
          stateManager = 8;
      }
    }
  }
  //handles gameplay input
  else if(stateManager == 4){
    if(keyCode === LEFT_ARROW){
      buttonSFX.play();
      activeTurret = constrain(activeTurret-1, 0, 2);
    }else if(keyCode === RIGHT_ARROW){
      buttonSFX.play();
      activeTurret = constrain(activeTurret+1, 0, 2);
    }
  }
  //handles highscore input
  else if (stateManager == 6){
    if(keyCode === UP_ARROW){
      buttonSFX.play();
      playerName[playerNameIndexToggle]++;
      if(playerName[playerNameIndexToggle] >= availableCharacters.length){
        playerName[playerNameIndexToggle] = 0;
      }
    }else if(keyCode === DOWN_ARROW){
      buttonSFX.play();
      playerName[playerNameIndexToggle]--;
      if(playerName[playerNameIndexToggle] < 0){
        playerName[playerNameIndexToggle] = availableCharacters.length - 1;
      }
    }else if(keyCode === RIGHT_ARROW){
      buttonSFX.play();
      playerNameIndexToggle++;
      if(playerNameIndexToggle > 2){
        playerNameIndexToggle = 0;
      }
    }else if(keyCode === LEFT_ARROW){
      buttonSFX.play();
      playerNameIndexToggle--;
      if(playerNameIndexToggle < 0){
        playerNameIndexToggle = 2;
      }
    }else if(keyCode === ENTER && newHighScore){
      buttonSFX.play();
      canTransition = true;
    }
  }
}



//handles mouse inputs which are almost exclusive to during gameplay (the exception being the main menu button but that is handled by its own function)
function mouseClicked() {
  if(stateManager == 4){
    if(turretObjs[activeTurret].volleyAmmo > 0 && turretObjs[activeTurret].isDestroyed == false){
      let missileObj = {
        startPos : createVector(turretObjs[activeTurret].pos.x, turretObjs[activeTurret].pos.y),
        targetPos : createVector(constrain(mouseX, 0, width), constrain(mouseY, 0, turretObjs[activeTurret].pos.y)),
        sprite : createSprite(turretObjs[activeTurret].pos.x, turretObjs[activeTurret].pos.y),
        targSprite : createSprite(constrain(mouseX, 0, width), constrain(mouseY, 0, turretObjs[activeTurret].pos.y))
      }
      missileObj.targSprite.addImage(crosshairIcon);

      missileObj.sprite.addAnimation("spinAnim", missileAnim);
      missileObj.sprite.rotateToDirection = true;
      missileObj.sprite.setCollider("circle", 0, 0, 20);

      missileObjs.push(missileObj);

      turretObjs[activeTurret].volleyAmmo--;
      turretObjs[activeTurret].ammoIcons--;
      missileLaunchSFX.play();
    }
  }
}



//the afformentioned main menu button function
function backToMenu(){
  buttonSFX.play();
  if(stateManager = 4){
    resetGameData();
  }
  stateManager = 3;
}



function draw(){
  //draws the appropriate items for the state the game is in
  switch(stateManager) {
    case 0:
      drawSplashScreen();
      menuButton.hide();
      break;
    case 1:
      introCutscene.play();
      menuButton.hide();
      stateManager++;
      break;
    case 2:
      image(introCutscene, 0, 0);
      menuButton.hide();
      break;
    case 3:
      drawMenu();
      menuButton.hide();
      break;
    case 4:
      drawGame();
      menuButton.show();
      break;
    case 5:
      drawEnd();menuButton.hide();
      break;
    case 6:
      drawEnterHighscore();
      menuButton.hide();
      break;
    case 7:
      drawHighscores();
      menuButton.show();
      break;
    default:
      drawNoteFromAuthor();
      menuButton.show();
  }

  if(stateManager == 3 || stateManager == 4){
    if(!music.isPlaying()){
      music.play();
    }
  }

  if(stateManager == 1){
    introCutscene.play();
    stateManager = 2;
  }
}



//once cutscene ends, transition state
function cutsceneEnded(){
    stateManager = 3;
}



//the initial splash screen (my way of ensuring the player interacts prior to the code attempting to play audio or video)
function drawSplashScreen(){
  background(0);
  fill(60, 255, 0);
  image(boxArtIMG, 0, 0);
  
  push();
  //the follwing block of if statements makes all the ui elements pulsate  
  if(textOpacityIncriment == 4){
    if(textOpacity < 255){
      textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
    }else{
      textOpacityIncriment = -4;
    }
  }else if(textOpacity > 150){
    textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
  }else{
    textOpacityIncriment = 4;
  }

  textSize(25);  
  noStroke();  
  fill(60, 255, 0, textOpacity);

  text('< press any button to begin >', 30, 200);
  
  pop();

  image(screenOverlayIMG, 0, 0, width, height);
}



//main menu
function drawMenu(){
  background(0);
  image(logoIMG, 27, 96);
  stroke(60, 255, 0);
  fill(60, 255, 0);
  line(0, 275, width, 275);

  push();

  //pulsating again - since this block of code gets repeated a number of times I would normally put it in a seperate function, however, I wasn't sure if it would play nice in the middle of a push/pop setup and I didn't have time to find out
  if(textOpacityIncriment == 4){
    if(textOpacity < 255){
      textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
    }else{
      textOpacityIncriment = -4;
    }
  }else if(textOpacity > 150){
    textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
  }else{
    textOpacityIncriment = 4;
  }

  noStroke();
  
  fill(60, 255, 0, textOpacity);  

  textSize(40);
  text('< start >', 1000, 100);
  text('< highscores >', 1000, 150);
  text('< note from creator >', 1000, 200);
  switch(menuSwitch) {
    case 0:
      text('>', 970, 100);
      break;
    case 1:
      text('>', 970, 150);
      break;
    default:
      text('>', 970, 200);
  }
  textSize(20);
  text('< select command using arrow keys. press enter to execute command >', 30, 200);

  //'tactical briefing' aka instructions
  for(i = 0; i < tacticalBriefing.length; i++){
    text('< ' + tacticalBriefing[i] + ' >', 100, 320 + 60*i, width-200, height-200);
  }

  pop();

  image(screenOverlayIMG, 0, 0, width, height);
}



//the draw game function is seperated into chunks for each type of object being handled
function drawGame(){
  background(0);
  image(backgroundIMG, 0, 0);

  scoreCounter++;
  if(scoreCounter >=30){
    score++;
    scoreCounter = 0;
  }
  
  nukeTimer += timerRate;
  truckTimer += timerRate;
  if(nukeTimer > spawnThreshHold){
    spawnNuke();
  }
  if(truckTimer > spawnThreshHold*11){
    spawnTruck();
  }  

  //draw cities
  for(i = 0; i < cityObjs.length; i++){    
    if (cityObjs[i].isBurning){
      if(cityObjs[i].burningTime == 0){
        cityObjs[i].isBurning = false;
        cityObjs[i].isDestroyed = true;
      }else if(cityObjs[i].burningTime < 180){
        deathToll += int(cityObjs[i].population*0.05/180);
        cityObjs[i].burningTime--;
      }else{
        deathToll += int(cityObjs[i].population*0.95)
        cityObjs[i].burningTime--;
        cityObjs[i].sprite.changeAnimation('cityDest');
        doomCounter++;
      }
    }
    drawSprite(cityObjs[i].sprite);
  }
  
  image(midgroundIMG, 0, 0);//placed here so it draws infront of cities 
  
  //draw nukes
  for(i = 0; i < nukeObjs.length; i++){
    let nukeDestroyed = false;
    nukeObjs[i].sprite.attractionPoint(1.2, nukeObjs[i].targetPos.x, nukeObjs[i].targetPos.y);
    nukeObjs[i].sprite.maxSpeed = 1.2;
    drawSprite(nukeObjs[i].sprite);

    //if the nuke hits an explosion
    if(nukeObjs[i].sprite.overlap(explosionSprites)){
      score += 5;
      nukeObjs.splice(i, 1);
      continue;
    }

    for(j = 0; j < cityObjs.length; j++){
      //if nuke hits a city
      if(nukeObjs[i].sprite.overlap(cityObjs[j].sprite)){
        if(!cityObjs[j].isBurning){
          if(!cityObjs[j].isDestroyed){
            cityObjs[j].isBurning = true;
          }
        }
        
        let explodeNukeSprite = createSprite(nukeObjs[i].targetPos.x, nukeObjs[i].targetPos.y+30);
        explodeNukeSprite.addAnimation('exp', nukeExplosionAnim);
        explodeNukeSprite.life = 36;
        explosionSprites.add(explodeNukeSprite);        
        nukeDestroyed = true;
        nukeObjs.splice(i, 1);

        nukeExplosionSFX.play();
        break;       
      }
    }
    if(nukeDestroyed){
      continue;
    }

    for(j = 0; j < turretObjs.length; j++){
      //if a nuke hits a turret
      if(nukeObjs[i].sprite.overlap(turretObjs[j].sprite)){
        let explodeNukeSprite = createSprite(turretObjs[j].pos.x, turretObjs[j].pos.y+30);
        explodeNukeSprite.addAnimation('exp', nukeExplosionAnim);
        explodeNukeSprite.life = 36;
        explodeNukeSprite.setCollider('circle', 0, 30, 1);
        explosionSprites.add(explodeNukeSprite); 

        if(!turretObjs[j].isDestroyed){
          deathToll += int(random(15, 30));
          turretObjs[j].isDestroyed = true;
        }        
        nukeObjs.splice(i, 1);

        nukeExplosionSFX.play();
        break;
      }
    }
  }

  //draw missiles
  for(i = 0; i < missileObjs.length; i++){
    missileObjs[i].sprite.attractionPoint(7, missileObjs[i].targetPos.x, missileObjs[i].targetPos.y);
    missileObjs[i].sprite.maxSpeed = 7;
    drawSprite(missileObjs[i].sprite);
    drawSprite(missileObjs[i].targSprite);
    if(dist(missileObjs[i].sprite.position.x, missileObjs[i].sprite.position.y, missileObjs[i].targetPos.x, missileObjs[i].targetPos.y) < 5){
      let expSprite = createSprite(missileObjs[i].targetPos.x, missileObjs[i].targetPos.y);
      expSprite.addAnimation("Expl", explosionAnim);
      expSprite.setCollider("circle", 0, 0, 35);
      expSprite.life = 48;
      explosionSprites.add(expSprite);
      missileObjs.splice(i, 1); 

      missileExplosionSFX.play();
    }
  }
  if(explosionSprites.length > 0){
    drawSprites(explosionSprites);
  }
  
  
  //draw turrets
  for(i = 0; i < turretObjs.length; i++){
    if(turretObjs[i].isDestroyed == true){
      animation(turretObjs[i].destroyedAnim, turretObjs[i].pos.x, turretObjs[i].pos.y); 
    }
    else{
      if(i == activeTurret){
        turretObjs[i].animFrame = constrain(int(mouseX/width*turretObjs[i].animFrameMax) +turretObjs[i].animFrameMin, turretObjs[i].animFrameMin, turretObjs[i].animFrameMax);
      }
      turretObjs[i].anim.changeFrame(turretObjs[i].animFrame);
      turretObjs[i].anim.stop();
      animation(turretObjs[i].anim, turretObjs[i].pos.x, turretObjs[i].pos.y);
  
      drawSprite(turretObjs[i].sprite);
  
      for(j = 0; j < turretObjs[i].ammoIcons; j++){
        if(j < 4){
          image(ammoIcon, turretObjs[i].pos.x + 6*j - 42, turretObjs[i].pos.y + 65, 6, 18);
        }else if(j < 8){
          image(ammoIcon, turretObjs[i].pos.x + 6*j - 36, turretObjs[i].pos.y + 65, 6, 18);
        }else{
          image(ammoIcon, turretObjs[i].pos.x + 6*j - 30, turretObjs[i].pos.y + 65, 6, 18);
        }
      }
    }  
    //reloads turrets when current volley hits zero
    if(turretObjs[i].volleyAmmo == 0 && turretObjs[i].ammo > 0){
      if(turretObjs[i].cooldown > 0){
        drawSprite(turretObjs[i].reloadingSprite);
        turretObjs[i].cooldown--;
      }else{
        turretObjs[i].volleyAmmo += 4;
        turretObjs[i].ammo -= 4;
        turretObjs[i].cooldown = 120;        
      }
    }
  }


  //draw trucks
  for(i = 0; i < truckObjs.length; i++){
    truckObjs[i].sprite.setSpeed(truckObjs[i].speed);
    drawSprite(truckObjs[i].sprite);
    if(truckObjs[i].sprite.position.x > width + 80){
      truckObjs.splice(i, 1);
    }else if (truckObjs[i].sprite.position.x > width -50 && truckObjs[i].deliveriesMade == 2){
      truckObjs[i].deliveriesMade = 3;
      turretObjs[2].ammo = constrain(turretObjs[2].ammo + 4, 0, 8);
      turretObjs[2].ammoIcons = constrain(turretObjs[2].ammoIcons + 4, 0, 12);
    }else if (truckObjs[i].sprite.position.x > width/2 && truckObjs[i].deliveriesMade == 1){
      truckObjs[i].deliveriesMade = 2;
      turretObjs[1].ammo = constrain(turretObjs[1].ammo + 4, 0, 8);
      turretObjs[1].ammoIcons = constrain(turretObjs[1].ammoIcons + 4, 0, 12);
    }else if (truckObjs[i].sprite.position.x > 50 && truckObjs[i].deliveriesMade == 0){
      truckObjs[i].deliveriesMade = 1;
      turretObjs[0].ammo = constrain(turretObjs[0].ammo + 4, 0, 8);
      turretObjs[0].ammoIcons = constrain(turretObjs[0].ammoIcons + 4, 0, 12);
    }
  }

  //draw bombers
  for(i = 0; i < bomberObjs.length; i++){
    if(bomberObjs[i].hasDroppedBomb == false){
      let tX = truckObjs[0].sprite.position.x;
      let tY = truckObjs[0].sprite.position.y;
      let bX = bomberObjs[i].sprite.position.x;
      let bY = bomberObjs[i].sprite.position.y;

      if(bX - tX  <= (tY - bY)/2 + dist(bX, bY, bX - (tY-bY)/2, tY)){
        bomberObjs[i].hasDroppedBomb = true;
        let bombObj = {
          sprite : createSprite(bX, bY),
          targetPos : createVector(tX + dist(bX, bY, bX - (tY-bY)/2, tY), tY)
        }
        bombObj.sprite.addImage(bombIMG);
        bombObj.sprite.rotateToDirection = true;
        bombObj.sprite.setCollider("circle", 0, 0, 40);
        bombObjs.push(bombObj);
      }
      bomberObjs[i].sprite.attractionPoint(2, bomberObjs[i].endPoint.x, bomberObjs[i].endPoint.y);
    }else{
      bomberObjs[i].endPoint.y = bomberObjs[i].endPoint.y -5;
      bomberObjs[i].sprite.attractionPoint(2, bomberObjs[i].endPoint.x, bomberObjs[i].endPoint.y);
    }
    bomberObjs[i].sprite.maxSpeed = 2;
    drawSprite(bomberObjs[i].sprite);

    if(bomberObjs[i].sprite.position.y < -100 ){
      bomberObjs.splice(i, 1);
    }else if(bomberObjs[i].sprite.overlap(explosionSprites)){
      bomberObjs.splice(i, 1);
      score += 10;
    }
  }

  //draw bombs
  for(i = 0; i < bombObjs.length; i++){
    if(dist(bombObjs[i].targetPos.x, bombObjs[i].targetPos.y, bombObjs[i].sprite.position.x, bombObjs[i].sprite.position.y) <= 5){
      let explodeTruckSprite = createSprite(bombObjs[i].targetPos.x, bombObjs[i].targetPos.y);
      explodeTruckSprite.addAnimation('exp', nukeExplosionAnim);
      explodeTruckSprite.life = 48;
      explosionSprites.add(explodeTruckSprite);
      truckObjs.splice(0, 1);
      bombObjs.splice(i, 1);
      deathToll +=2;
      bombExplosionSFX.play();
    }else if(bombObjs[i].sprite.overlap(explosionSprites)){
      bombObjs.splice(i, 1);
      score += 5;
    }else{
      bombObjs[i].sprite.attractionPoint(1.5, bombObjs[i].targetPos.x, bombObjs[i].targetPos.y);
      bombObjs[i].sprite.maxSpeed = 1.5;
      drawSprite(bombObjs[i].sprite);
    }
  }

  push();
  //pulsating again
  if(textOpacityIncriment == 4){
    if(textOpacity < 255){
      textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
    }else{
      textOpacityIncriment = -4;
    }
  }else if(textOpacity > 150){
    textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
  }else{
    textOpacityIncriment = 4;
  }

  noStroke();  
  fill(60, 255, 0, textOpacity);
  textSize(18);

  text('Deathtoll: ' + deathToll, 10, height-14);
  text('Score: ' + score, width - 190, height - 14);
  textSize(120);
  text('[  ]', turretObjs[activeTurret].pos.x - 68, turretObjs[activeTurret].pos.y + 35);

  stroke(60, 255, 0);
  strokeWeight(2);

  //boxes along bottom of screen
  line(0, 860, width, 860);
  line(200, 860, 200, height);
  line(width - 200, 860, width - 200, height);

  pop();

  //if all citys have been destroyed, ends the game (after a brief delay so its not instant)
  if(doomCounter == 4){
    if(transitionDelay < 90){
      transitionDelay++;
    }else{
      stateManager = 5;
      transitionDelay = 0;
    }
  }
  image(screenOverlayIMG, 0, 0, width, height);
}



function spawnNuke(){
  nukeTimer = 0;
  nukeCounter++;
  if(nukeCounter > 12){
    timerRate = timerRate*1.15;//this is important - every 12 nukes that are spawned, the rate of the nukes spawning increases
    nukeCounter = 0;
  }

  //ensures only valid (undestroyed) targets are in the target array
  for(i = 0; i < nukeTargets.length; i++){
    if(nukeTargets[i].isDestroyed){
      nukeTargets.splice(i, 1);
    }
  }

  targToPick = int(random(0, nukeTargets.length));

  let nukeObj = {
    sprite : createSprite(random(0, width), -20),
    targetPos : createVector(nukeTargets[targToPick].pos.x, nukeTargets[targToPick].pos.y)
  }
  nukeObj.sprite.addAnimation("spinAnim", nukeAnim);
  nukeObj.sprite.rotateToDirection = true;
  nukeObj.sprite.setCollider("circle", 0, 0, 40);

  nukeObjs.push(nukeObj);
}



//also called every 12 nukes
function spawnTruck(){
  truckTimer = 0;
  let truckDir;
  let truckStartX;

  let truckObj = {
    speed : 1.5,
    sprite : createSprite(-80, height - 100),
    anim : truckAnim,
    deliveriesMade : 0,
    startPosX : -80
  }
  truckObj.sprite.addAnimation('driving', truckObj.anim);
  truckObj.sprite.setCollider('rectangle', 0, 0, 100, 50);

  truckObjs.push(truckObj);
  
  //if there is currently no bomber on screen, a bomber is scored
  if(bomberObjs.length == 0){
    let altitude = random(100, 500);
    let bomberObj = {
      sprite : createSprite(width + 80, altitude),
      speed : 2,
      endPoint : createVector(-100, altitude),
      hasDroppedBomb : false
    }
    bomberObj.sprite.addAnimation('bomber', bomberAnim);
    bomberObj.sprite.setCollider('rectangle', 0, 0, 100, 50);
    bomberObj.sprite.rotateToDirection = true;
  
    bomberObjs.push(bomberObj);
  }
}



function drawEnd(){
  music.stop();
  transitionDelay++;
  image(screenOverlayIMG, 0, 0, width, height);

  push();
  if(textOpacityIncriment == 4){
    if(textOpacity < 255){
      textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
    }else{
      textOpacityIncriment = -4;
    }
  }else if(textOpacity > 150){
    textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
  }else{
    textOpacityIncriment = 4;
  }

  noStroke();
  fill(60, 255, 0, textOpacity);
  textSize(180);

  textAlign(CENTER);
  text('The End', width/2, height/2);

  pop();

  if(transitionDelay > 120){
    background(0);
    stateManager++;
    transitionDelay = 0;
  }
}



//if the player has a score that places them in the top 30, this prompts the player to provide a name. Otherwise, it skips straight to the main menu. 
//It's impossible to score less than the lowest of these highscores so the play will always make the leaderboard on their first game, but subsequent games, they must outdo their own scores
function drawEnterHighscore(){
  for(i = 0; i < 30; i++){
    if(score >= int(highscoreData[i].score)){
      newHighScore = true;
      scoreRank = i;
      break;
    }
    if(i == 29){
      canTransition = true;
    }
  }
  if(canTransition){
    if(newHighScore){
      let tempScoreObj = {
        name : availableCharacters[playerName[0]] + availableCharacters[playerName[1]] + availableCharacters[playerName[2]],
        score: score.toString()
      }
      highscoreObjs.splice(scoreRank, 0, tempScoreObj);
      if(highscoreData.length > 30){
        highscoreObjs.length = 30
      }
    }
    resetGameData();
    stateManager = 7;
  }else if (newHighScore){
    promptInput();
  }
  image(screenOverlayIMG, 0, 0, width, height);
}



function promptInput(){
  push();
  if(textOpacityIncriment == 4){
    if(textOpacity < 255){
      textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
    }else{
      textOpacityIncriment = -4;
    }
  }else if(textOpacity > 150){
    textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
  }else{
    textOpacityIncriment = 4;
  }

  noStroke();
  fill(60, 255, 0, textOpacity);
  textSize(20);

  text('< use arrow keys to set name >', 100, 100);
  text('< press enter to confirm user name >', 100, 124);

  text('< ', 600, 100);
  text(availableCharacters[playerName[0]], 620, 100);
  text(availableCharacters[playerName[1]], 640, 100);
  text(availableCharacters[playerName[2]], 660, 100);
  text(' >', 680, 100);
  text('< ' + score + ' >', 720, 100);

  text('v', 622 + playerNameIndexToggle*20, 118);
  text('^', 623 + playerNameIndexToggle*20, 86);

  pop();
}



//resets all gameplay data ready for another round
function resetGameData(){
  turretObjs.length = 0;
  nukeObjs.length = 0;
  missileObjs.length = 0;
  truckObjs.length = 0;
  bomberObjs.length = 0;
  bombObjs.length = 0;
  cityObjs.length = 0;
  
  explosionSprites.length = 0;
  
  activeTurret = 1;
  
  timerRate = 1;
  nukeTimer = 0; 
  truckTimer = 0;
  nukeCounter = 0;
  
  nukeTargets.length = 0;
  
  doomCounter = 0;
  transitionDelay = 0;
  
  deathToll = 0;
  score = 0;
  scoreCounter =0;  
  
  playerName = [0,0,0];
  playerNameIndexToggle = 0;
  newHighScore = false;
  canTransition = false;
  scoreRank = 0;
  
  menuSwitch = 0;
  textOpacity = 255;

  setupTurrets();
  setupCities();
}



function drawHighscores(){
  background(0);

  push();
  if(textOpacityIncriment == 4){
    if(textOpacity < 255){
      textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
    }else{
      textOpacityIncriment = -4;
    }
  }else if(textOpacity > 150){
    textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
  }else{
    textOpacityIncriment = 4;
  }

  noStroke();
  fill(60, 255, 0, textOpacity);
  textSize(20);

  text('< displaying data: "highscores" >', 100, 100);
  for(i = 0; i < 30; i++){
    text(highscoreObjs[i].name +':', 600, 100 + i*24);
    text(highscoreObjs[i].score, 680, 100 + i*24);
  }

  pop();
  
  image(screenOverlayIMG, 0, 0, width, height);
}



function drawNoteFromAuthor(){
  background(0);

  push();
  if(textOpacityIncriment == 4){
    if(textOpacity < 255){
      textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
    }else{
      textOpacityIncriment = -4;
    }
  }else if(textOpacity > 150){
    textOpacity = constrain(textOpacity+textOpacityIncriment, 150, 255);
  }else{
    textOpacityIncriment = 4;
  }

  noStroke();
  fill(60, 255, 0, textOpacity);
  textSize(30);

  text('< ' + noteFromCreator + ' >', 100, 100, width-200, height-200);

  pop();
  
  image(screenOverlayIMG, 0, 0, width, height);
}