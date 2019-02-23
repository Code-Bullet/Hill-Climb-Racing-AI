//this is a template to add a NEAT ai to any game
//note //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
//this means that there is some information specific to the game to input here
var Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;

var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2StaticBody = Box2D.Dynamics.b2Body.b2_staticBody;
var b2DynamicBody = Box2D.Dynamics.b2Body.b2_dynamicBody;
var b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

var b2PrismaticJoint = Box2D.Dynamics.Joints.b2PrismaticJoint;

var b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;

var b2FilterData = Box2D.Dynamics.b2FilterData;

var b2DistanceJoint = Box2D.Dynamics.Joints.b2DistanceJoint;
var b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;

var b2WeldJoint = Box2D.Dynamics.Joints.b2WeldJoint;
var b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;

//------------------------------------------GLOBALS
var SCALE = 30;
var groundBody;
var wheels = [];
var groundTemplate;

var pause = false;

var panX = 0;
var targetPanX = 0;
var maxPanSpeed = 100;
var panSpeed = 50;
var panAcc = 10;
var panY = 0;

var leftDown = false;
var rightDown = false;
var listener = new Box2D.Dynamics.b2ContactListener;
// var listener2 = new Box2D.Dynamics.b2ContactListener;

var carSprite;
var headSprite;
var cbHead = false;
var wheelSprite;
var shownGround = false;

var spawningY = 0;

//collisionCatagories i.e what it is


var WHEEL_CATEGORY = 0x0001;
var CHASSIS_CATEGORY = 0X0002;
var GRASS_CATEGORY = 0X0004;
var DIRT_CATEGORY = 0x0008;
var PERSON_CATEGORY = 0x0010;

//collision Masks ie. what it collides with
var WHEEL_MASK = (GRASS_CATEGORY);
var CHASSIS_MASK = (DIRT_CATEGORY);
var GRASS_MASK = (WHEEL_CATEGORY | PERSON_CATEGORY);
var DIRT_MASK = (CHASSIS_CATEGORY);
var PERSON_MASK = (GRASS_CATEGORY);

var resetCounter = 120;
var reset = false;

var p;
var p2;
var nextPanX = 0;


var nextConnectionNo = 1000;
var population;
var speed = 60;


var showBest = false; //true if only show the best of the previous generation
var runBest = false; //true if replaying the best ever game
var humanPlaying = false; //true if the user is playing

var fightMode = false; //true when the player is fighting the best every player
var humanPlayer;


var showBrain = false;

var showBestEachGen = false;
var upToGen = 0;
var genPlayerTemp; //player

var showNothing = false;

var currentBestPlayer;
var spawnHeight = 0;
//--------------

var playersInEachWorld = [];


var grassSprites = [];

// var ground;
// var world;

var otherWorld; // for human, gen replay, species, best
var worlds = [];
var grounds = [];
var numberOfWorlds = 50;
var playersPerWorld = 15;


var skySprite;
var darknessSprite;
var difficulty = 50;

listener.BeginContact = function(contact) {
  let world = contact.GetFixtureA().GetBody().GetWorld();
  if (reset) {
    return;
  }
  if (contact.GetFixtureA().GetBody().GetUserData().id == "head") {
    if (contact.GetFixtureB().GetBody().GetUserData().id == "ground") {

      if (contact.GetFixtureA().GetBody().GetJointList() == null) {
        return;
      }
      let car = contact.GetFixtureA().GetBody().GetJointList().other.GetJointList().other.GetUserData(); //i think that is the grossest code i have ever written

      world.DestroyJoint(car.distJoint);
      world.DestroyJoint(car.person.distJoint);
      world.DestroyJoint(car.revJoint);
      world.DestroyJoint(car.person.headJoint);
      car.player.kindaDead = true;
    }
  }

  if (contact.GetFixtureB().GetBody().GetUserData().id == "head") {
    if (contact.GetFixtureA().GetBody().GetUserData().id == "ground") {

      if (contact.GetFixtureB().GetBody().GetJointList() == null) {
        return;
      }
      let car = contact.GetFixtureB().GetBody().GetJointList().other.GetJointList().other.GetUserData(); //i think that is the grossest code i have ever written
      world.DestroyJoint(car.distJoint);
      world.DestroyJoint(car.person.distJoint);
      world.DestroyJoint(car.revJoint);
      world.DestroyJoint(car.person.headJoint);
      car.player.kindaDead = true;
    }
  }

  if (contact.GetFixtureA().GetBody().GetUserData().id == "wheel") {
    if (contact.GetFixtureB().GetBody().GetUserData().id == "ground") {
      createDiv("oi fuck");

      contact.GetFixtureA().GetBody().GetUserData().onGround = true;
    }
  }

  if (contact.GetFixtureB().GetBody().GetUserData().id == "wheel") {
    if (contact.GetFixtureA().GetBody().GetUserData().id == "ground") {

      contact.GetFixtureB().GetBody().GetUserData().onGround = true;

    }
  }
}

//
// listener2.BeginContact = function(contact) {
//
//
// }
listener.EndContact = function(contact) {

  if (contact.GetFixtureA().GetBody().GetUserData().id == "wheel") {
    if (contact.GetFixtureB().GetBody().GetUserData().id == "ground") {

      contact.GetFixtureA().GetBody().GetUserData().onGround = false;
    }
  }

  if (contact.GetFixtureB().GetBody().GetUserData().id == "wheel") {
    if (contact.GetFixtureA().GetBody().GetUserData().id == "ground") {

      contact.GetFixtureB().GetBody().GetUserData().onGround = false;

    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------------------------
function preload() {
  CBHeadSprite = loadImage("Pics/CBHead3.png");
  headSprite = loadImage("Pics/headLarge.png");
  skySprite = loadImage("Pics/sky.png");
  darknessSprite = loadImage("Pics/darkness.png");

  carSprite = loadImage("Pics/car.png");
  wheelSprite = loadImage("Pics/wheel2.png");
  grassSprites.push(loadImage("Pics/grass.png"));
  grassSprites.push(loadImage("Pics/grass2.png"));
  grassSprites.push(loadImage("Pics/grass3.png"));
  grassSprites.push(loadImage("Pics/grass4.png"));
  grassSprites.push(loadImage("Pics/grass5.png"));
  grassSprites.push(loadImage("Pics/grass5.png"));


}

function setup() {
  window.canvas = createCanvas(1280, 720);
  canvas.parent("canvas");
  frameRate(30); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<FRAME RATE


  groundTemplate = new Ground();
  groundTemplate.randomizeGround();

  while (groundTemplate.isTooSteep()) {
    groundTemplate = new Ground();
    groundTemplate.randomizeGround();
  }


  for (var i = 0; i < numberOfWorlds; i++) {
    let tempWorld = new b2World(new Vec2(0, 10), true);
    let tempGround = new Ground(tempWorld);
    tempGround.cloneFrom(groundTemplate);
    tempGround.setBodies(tempWorld);
    tempWorld.SetContactListener(listener);
    // tempWorld.SetContactListener(listener2);

    grounds.push(tempGround);
    worlds.push(tempWorld);
    playersInEachWorld.push(0);
  }

  otherWorld = new b2World(new Vec2(0, 10), true);
  let tempGround = new Ground(otherWorld);
  tempGround.cloneFrom(groundTemplate);
  tempGround.setBodies(otherWorld);
  otherWorld.SetContactListener(listener);

  //
  // ground = new Ground(world);
  // ground.cloneFrom(groundTemplate);
  // ground.setBodies(world); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  // world.SetContactListener(listener);

  population = new Population();
  humanPlayer = new Player(true);
  currentBestPlayer = population.players[0];

}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function draw() {

  if (pause) {
    return;
  }
  shownGround = false;
  drawToScreen();
  nextPanX = -100;


  // world.Step(1 / 30, 10, 10);

  if (showBestEachGen) { //show the best of each gen
    if (!genPlayerTemp.dead) { //if current gen player is not dead then update it
      otherWorld.Step(1 / 30, 10, 10);
      genPlayerTemp.look();
      genPlayerTemp.think();
      genPlayerTemp.update();
      genPlayerTemp.show();
    } else { //if dead move on to the next generation
      upToGen++;
      if (upToGen >= population.genPlayers.length) { //if at the end then return to the start and stop doing it
        upToGen = 0;
        showBestEachGen = false;
      } else { //if not at the end then get the next generation
        genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
        genPlayerTemp.addToWorld();
      }
    }
  } else
  if (humanPlaying) { //if the user is controling the ship[
    if (!humanPlayer.dead) { //if the player isnt dead then move and show the player based on input
      otherWorld.Step(1 / 30, 10, 10);

      humanPlayer.update();
      humanPlayer.show();
      humanPlayer.look();

    } else { //once done return to ai
      humanPlaying = false;
    }
  } else
  if (runBest) { // if replaying the best ever game
    if (!population.bestPlayer.dead) { //if best player is not dead
      otherWorld.Step(1 / 30, 10, 10);

      population.bestPlayer.look();
      population.bestPlayer.think();
      population.bestPlayer.update();
      population.bestPlayer.show();
    } else { //once dead
      runBest = false; //stop replaying it
      population.bestPlayer = population.bestPlayer.cloneForReplay(); //reset the best player so it can play again
    }
  } else if (fightMode) {
    if (!population.bestPlayer.dead || !humanPlayer.dead) {
      otherWorld.Step(1 / 30, 10, 10);
      humanPlayer.update();
      humanPlayer.show();
      population.bestPlayer.look();
      population.bestPlayer.think();
      population.bestPlayer.update();
      population.bestPlayer.show();
    } else {
      fightMode = false;
      population.bestPlayer = population.bestPlayer.cloneForReplay();
    }
  } else { //if just evolving normally
    if (!population.done()) { //if any players are alive then update them
      // for (var w of worlds) {
      //   w.Step(1 / 30, 10, 10);
      // }
      population.stepWorldsInBatch();
      population.updateAlive();
    } else { //all dead
      //genetic algorithm
      // grounds[0].show()
      population.naturalSelection();
      currentBestPlayer = population.players[0];
      panX = 0;
      nextPanX = 0;
      targetX = 0;
    }
  }

  targetPanX = nextPanX;
  let tempMult = 1;
  if (abs(targetPanX - panX) > 20 * panSpeed) {
    tempMult = 5; //floor(abs(targetPanX - panX) / 60);
    console.log(tempMult);
  }
  if (abs(targetPanX - panX) < panSpeed * tempMult) {
    panX = targetPanX;

  } else if (targetPanX - panX < 0) {
    panX -= panSpeed * tempMult;

  } else {
    panX += panSpeed * tempMult;
  }

  if (!shownGround) {
    grounds[0].show();
  }
  if (panX < 0) {
    image(darknessSprite, -panX, 400);

  } else {
    image(darknessSprite, 0, 400);

  }

}


//---------------------------------------------------------------------------------------------------------------------------------------------------------
//draws the display screen
function drawToScreen() {
  if (!showNothing) {
    // background(120, 200, 255);
    image(skySprite, 0, 0);


    //pretty stuff
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace

    drawBrain();
    writeInfo();
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function drawBrain() { //show the brain of whatever genome is currently showing
  var startX = 600; //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  var startY = 10;
  var w = 600;
  var h = 300;

  if (runBest) {
    population.bestPlayer.brain.drawGenome(startX, startY, w, h);
  } else
  if (humanPlaying) {
    showBrain = false;
  } else if (showBestEachGen) {
    genPlayerTemp.brain.drawGenome(startX, startY, w, h);
  } else if (!fightMode) {
    currentBestPlayer.brain.drawGenome(startX, startY, w, h);
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//writes info about the current player
function writeInfo() {
  fill(255);
  stroke(255);
  strokeWeight(1);
  textAlign(LEFT);
  textSize(30);
  if (showBestEachGen) {
    text("Score: " + genPlayerTemp.score, 50, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    text("Gen: " + (genPlayerTemp.gen + 1), 50, 100);
  } else
  if (humanPlaying) {
    text("Score: " + humanPlayer.score, 100, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    humanPlayer.look();
    // text("vision[0]: " + humanPlayer.vision[0], 100, 100);
    // text("vision[1]: " + humanPlayer.vision[1], 100, 150);
    // text("vision[2]: " + humanPlayer.vision[2], 100, 200);
    //
    // text("vision[3]: " + humanPlayer.vision[3], 100, 250);
    // text("vision[4]: " + humanPlayer.vision[4], 100, 300);
    // text("vision[5]: " + humanPlayer.vision[5], 100, 350);
    // text("vision[6]: " + humanPlayer.vision[6], 700, 100);
    // text("vision[7]: " + humanPlayer.vision[7], 700, 150);
    // text("vision[8]: " + humanPlayer.vision[8], 700, 200);
    // text("vision[9]: " + humanPlayer.vision[9], 700, 250);
    // text("vision[10]: " + humanPlayer.vision[10], 700, 300);
  } else
  if (runBest) {
    text("Score: " + population.bestPlayer.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    text("Gen: " + population.gen, 1150, 50);
  } else {
    if (showBest) {
      text("Score: " + population.players[0].score, 50, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      text("Gen: " + population.gen, 50, 100);
      // text("Species: " + population.species.length, 50, 150);
      // text("Global Best Score: " + population.globalBestScore, 50, 200);
    } else if (fightMode) {
      text("Your Score: " + humanPlayer.score, 100, 50);
      text("Enemy Score: " + population.bestPlayer.score, 850, 50);
    } else {
      text("Score: " + currentBestPlayer.score, 50, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      text("Gen: " + population.gen, 300, 50);

      // text("Species: " + population.species.length, 50, 150);
      // text("Global Best Score: " + population.globalBestScore, 50, 200);
      // text("Species: " + population.species.length, 50, canvas.height / 2 + 300);
      // text("Global Best Score: /" + max(population.bestScore, currentBestPlayer.score), 50, canvas.height / 2 + 200);
    }
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function keyPressed() {
  switch (key) {
    case ' ':
      //toggle showBest
      showBest = !showBest;
      break;
      // case '+': //speed up frame rate
      //   speed += 10;
      //   frameRate(speed);
      //   prvarln(speed);
      //   break;
      // case '-': //slow down frame rate
      //   if(speed > 10) {
      //     speed -= 10;
      //     frameRate(speed);
      //     prvarln(speed);
      //   }
      //   break;
    case 'F':
      if (population.gen != 1) {

        fightMode = !fightMode;
        population.bestPlayer = population.bestPlayer.cloneForReplay();
        humanPlayer = humanPlayer.cloneForReplay();

        if (fightMode) {
          humanPlayer.addToWorld();
          population.bestPlayer.addToWorld();

        }
      }
      break;
    case 'B': //run the best
      if (population.gen != 1) {
        runBest = !runBest;
        population.bestPlayer = population.bestPlayer.cloneForReplay();
        if (runBest) {
          population.bestPlayer.addToWorld();
        }
      }
      break;
    case 'G': //show generations
      if (population.gen != 1) {
        showBestEachGen = !showBestEachGen;
        if (!showBestEachGen) {
          genPlayerTemp.removePlayerFromWorld();
        }
        upToGen = 0;
        genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
        if (showBestEachGen) {
          genPlayerTemp.addToWorld();

        }
      }
      break;
    case 'N': //show absolutely nothing in order to speed up computation
      showNothing = !showNothing;
      break;
    case 'P': //play
      humanPlaying = !humanPlaying;
      if (humanPlaying) {
        humanPlayer = humanPlayer.cloneForReplay();
        humanPlayer.addToWorld();
      }

      break;


    case 'S':
      pause = !pause;
      break;
  }
  //any of the arrow keys
  switch (keyCode) {
    case UP_ARROW: //the only time up/ down / left is used is to control the player
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      break;
    case DOWN_ARROW:
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      break;
    case LEFT_ARROW:
      leftDown = true;
      humanPlayer.car.motorOn(false);
      break;
    case RIGHT_ARROW: //right is used to move through the generations
      if (showBestEachGen) { //if showing the best player each generation then move on to the next generation
        upToGen++;
        if (upToGen >= population.genPlayers.length) { //if reached the current generation then exit out of the showing generations mode
          showBestEachGen = false;
        } else {
          genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
          genPlayerTemp.addToWorld();

        }
      } else if (humanPlaying || fightMode) { //if the user is playing then move player right
        rightDown = true;
        humanPlayer.car.motorOn(true);
        break;
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      }
      break;
  }
}

function keyReleased() {
  if (humanPlaying || fightMode) {
    switch (keyCode) {
      case RIGHT_ARROW:
        rightDown = false;
        if (leftDown) {
          humanPlayer.car.motorOn(false);
        } else {
          humanPlayer.car.motorOff();
        }
        break;
      case LEFT_ARROW:
        leftDown = false;
        if (rightDown) {
          humanPlayer.car.motorOn(true);
        } else {
          humanPlayer.car.motorOff();
        }
        break;
    }
  }
}

function clearWorlds() {
  for (var i = 0; i < playersInEachWorld.length; i++) {
    playersInEachWorld[i] = 0;
  }
}

function getFreeWorld() {
  for (var i = 0; i < playersInEachWorld.length; i++) {
    if (playersInEachWorld[i] < playersPerWorld) {
      playersInEachWorld[i]++;
      return (worlds[i]);
    }
  }

  return (worlds[0]);
}

function newWorlds() {
  console.log("New WOrld");
  console.log(groundTemplate.vectors);
  groundTemplate = new Ground();
  groundTemplate.randomizeGround();


  while (groundTemplate.isTooSteep()) {
    groundTemplate = new Ground();
    groundTemplate.randomizeGround();
  }
  console.log(groundTemplate.vectors);

  grounds = [];
  worlds = [];
  playersInEachWorld = [];
  for (var i = 0; i < numberOfWorlds; i++) {
    let tempWorld = new b2World(new Vec2(0, 10), true);
    let tempGround = new Ground(tempWorld);
    tempGround.cloneFrom(groundTemplate);
    tempGround.setBodies(tempWorld);
    tempWorld.SetContactListener(listener);
    // tempWorld.SetContactListener(listener2);

    grounds.push(tempGround);
    worlds.push(tempWorld);
    playersInEachWorld.push(0);
  }

  otherWorld = new b2World(new Vec2(0, 10), true);
  let tempGround = new Ground(otherWorld);
  tempGround.cloneFrom(groundTemplate);
  tempGround.setBodies(otherWorld);
  otherWorld.SetContactListener(listener);

  population.bestScore = 0; //the score of the best ever player
  population.globalBestScore = 0;


  //
  // ground = new Ground(world);
  // ground.cloneFrom(groundTemplate);
  // ground.setBodies(world); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  // world.SetContactListener(listener);
}
