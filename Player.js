class Player {

  constructor(differentWorld) {

    this.fitness = 0;
    this.vision = []; //the input array fed into the neuralNet
    this.decision = []; //the out put of the NN
    this.unadjustedFitness;
    this.lifespan = 0; //how long the player lived for this.fitness
    this.bestScore = 0; //stores the this.score achieved used for replay
    this.dead = false;
    this.kindaDead = false; //this is true when the player has died but deadcount isn't up
    this.score = 0;
    this.gen = 0;
    if (differentWorld) {
      this.world = otherWorld;
    } else {
      this.world = getFreeWorld();
    }


    this.shirtColorR = floor(random(255));
    this.shirtColorG = floor(random(255));
    this.shirtColorB = floor(random(255));



    this.lastGrounded = 0;

    this.genomeInputs = 5;
    this.genomeOutputs = 2;
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
    this.car;
    // this.world.SetContactListener(listener);
    //
    // this.ground = new Ground(this.world);
    // this.ground.cloneFrom(groundTemplate);
    // var timer = millis();
    //
    // this.ground.setBodies(this.world);
    // timer = millis() - timer;
    this.isCB = (floor(random(2)) == 0) ? true : false;

    this.deadCount = 50;
    this.motorState = 2;

  }

  addToWorld() {
    this.car = new Car(350, spawningY, this.world, this);
    this.car.setShirt();
    this.car.person.head.isCB = this.isCB;
  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  show() {
      if (!this.kindaDead || this.deadCount > 0) {
        this.car.show();
        if (!shownGround) {
          grounds[0].show();
          shownGround = true;
        }
      }
    }
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
  move() {}
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
  update() {
      if (this.car.dead) {
        this.kindaDead = true;
      }
      if (!this.kindaDead || this.deadCount > 0) {
        // this.world.Step(1 / 30, 10, 10);
        this.lifespan++;
        this.car.update();
      } else {
        this.dead = true;
      }

      if (this.kindaDead) {
        this.deadCount--;
      }
      this.score = max(1, floor((this.car.maxDistance - 349) / 10));
      if (this.score > currentBestPlayer.score || currentBestPlayer.dead) {
        currentBestPlayer = this;
      }

      if (this.dead) {
        this.removePlayerFromWorld();
      }
    }
    //----------------------------------------------------------------------------------------------------------------------------------------------------------

  look() {
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    this.vision = [];
    this.vision[0] = this.car.chassisBody.GetAngle();
    while (this.vision[0] < 0) {
      this.vision[0] += 2 * PI;
    }
    this.vision[0] = (this.vision[0] + PI) % (2 * PI);
    this.vision[0] = map(this.vision[0], 0, 2 * PI, 0, 1);
    this.lastGrounded++;
    if (this.car.wheels[0].onGround || this.car.wheels[1].onGround) {
      this.vision[1] = 1;
      this.lastGrounded = 0;
    } else {
      if (this.lastGrounded < 10) {
        this.vision[1] = 1;
      } else {
        this.vision[1] = 0;
      }

    }
    //
    // this.vision[2] = map(this.car.chassisBody.GetLinearVelocity().x, -17, 17, -1, 1);
    // this.vision[3] = map(this.car.chassisBody.GetLinearVelocity().y, -12, 12, -1, 1);
    this.vision.push(map(this.car.chassisBody.GetAngularVelocity(), -4, 4, -1, 1));

    // this.vision[3] = this.car.chassisBody.GetLinearVelocity().y;
    // this.vision[4] = this.car.chassisBody.GetAngularVelocity();
    //
    //
    //


    let temp = (groundTemplate.getPositions(this.car.chassisBody.GetPosition().x, 2, 5));
    let first = temp[0];
    this.vision.push(map(constrain(first - this.car.chassisBody.GetPosition().y - this.car.chassisHeight / SCALE, 0, 10), 0, 10, 0, 1));

    for (var i = 1; i < temp.length; i++) {
      temp[i] -= first;
      temp[i] = map(temp[i], -3, 3, -1, 1);
      this.vision.push(temp[i]);
    }

    //
    // let oi = groundTemplate.getPositions(this.car.chassisBody.GetPosition().x, 10, 1);
    //
    // var totalDifference = 0;
    // for (var i = 1; i < oi.length; i++) {
    //   totalDifference += max(0, oi[i - 1] - oi[i]);
    // }
    //
    // if (frameCount % 100 == 0) {
    //   console.log(totalDifference);
    // }
    // groundTemplate.showPoints(this.car.chassisBody.GetPosition().x, 10, 1);

    // createDiv(this.vision[0]);


  }



  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //gets the output of the this.brain then converts them to actions
  think() {

      var max = 0;
      var maxIndex = 0;
      //get the output of the neural network
      this.decision = this.brain.feedForward(this.vision);

      for (var i = 0; i < this.decision.length; i++) {
        if (this.decision[i] > max) {
          max = this.decision[i];
          maxIndex = i;
        }
      }
      if (max < 0.6) {
        if (this.motorState == 2) {
          return;
        }

        this.car.motorOff();
        this.motorState = 2;
        return;
      }

      switch (maxIndex) {
        case 0:
          if (this.motorState == 0) {
            return;
          }
          this.car.motorOn(true);
          this.motorState = 0;
          break;
        case 1:
          if (this.motorState == 1) {
            return;
          }
          this.car.motorOn(false);
          this.motorState = 1;
          break;
          // case 2:
          //   if (this.motorState == 2) {
          //     return;
          //   }
          //
          //   this.car.motorOff();
          //   this.motorState = 2;
          //   break;
      }

      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace


    }
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    //returns a clone of this player with the same brian
  clone() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    clone.shirtColorR = this.shirtColorR + random(-2, 2);
    clone.shirtColorG = this.shirtColorG + random(-2, 2);
    clone.shirtColorB = this.shirtColorB + random(-2, 2);
    clone.addToWorld();


    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
  //this fuction does that

  cloneForReplay() {
    var clone = new Player(true);
    if (!this.dead && this.car != null) {
      this.removePlayerFromWorld();
    }
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    clone.shirtColorR = this.shirtColorR;
    clone.shirtColorG = this.shirtColorG;
    clone.shirtColorB = this.shirtColorB;
    clone.isCB = this.isCB;


    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //fot Genetic algorithm
  calculateFitness() {
    this.fitness = this.score;
    // this.score = this.fitness;
    this.fitness *= this.fitness;
    this.fitness *= map(this.score / this.lifespan, 0, 1, 0.9, 1);

    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  crossover(parent2) {

    var child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    child.shirtColorR = this.shirtColorR + random(-10, 10);
    child.shirtColorG = this.shirtColorG + random(-10, 10);
    child.shirtColorB = this.shirtColorB + random(-10, 10);
    // child.shirtColorR = constrain((1.5 * this.shirtColorR + 0.5 * parent2.shortColorR) / 2 + random(-2, 2), 0, 255);
    // child.shirtColorG = constrain((1.5 * this.shirtColorG + 0.5 * parent2.shortColorG) / 2 + random(-2, 2), 0, 255);
    // child.shirtColorB = constrain((1.5 * this.shirtColorB + 0.5 * parent2.shortColorB) / 2 + random(-2, 2), 0, 255);
    child.addToWorld();
    // child.car.setShirt();
    if (random(1) < 0.99) {
      child.isCB = this.isCB;
    } else {
      child.isCB = !this.isCB;
    }
    return child;
  }

  removePlayerFromWorld() {
    this.world.DestroyBody(this.car.chassisBody);
    this.world.DestroyBody(this.car.wheels[0].body);
    this.world.DestroyBody(this.car.wheels[0].rimBody);
    this.world.DestroyBody(this.car.wheels[1].body);
    this.world.DestroyBody(this.car.wheels[1].rimBody);
    this.world.DestroyBody(this.car.person.head.body);
    this.world.DestroyBody(this.car.person.torso.body);
  }
  resetCar() {
    this.world.DestroyBody(this.car.chassisBody);
    this.world.DestroyBody(this.car.wheels[0].body);
    this.world.DestroyBody(this.car.wheels[0].rimBody);
    this.world.DestroyBody(this.car.wheels[1].body);
    this.world.DestroyBody(this.car.wheels[1].rimBody);
    this.world.DestroyBody(this.car.person.head.body);
    this.world.DestroyBody(this.car.person.torso.body);

    this.car = new Car(150, 0, this.world, this);
    reset = false;
    resetCounter = 120;
    panX = 0;
  }

}
